use std::collections::HashMap;

use std::sync::Arc;
use crate::{utils::app_state::AppState, utils::auth::Auth};
use actix_web::{web, Error, HttpRequest, HttpResponse};
use actix_web_actors::ws;
use futures_util::{
    future::{select, Either},
    StreamExt,
};
use sea_orm::{ActiveModelTrait, ActiveValue::Set};
use serde::{Deserialize, Serialize};

async fn ws(
    app_state: std::sync::Arc<AppState>,
    auth: Arc<Auth>,
    mut session: actix_ws::Session,
    mut msg_stream: actix_ws::MessageStream,
) -> Result<(), Box<dyn std::error::Error>> {
    let is_calculating_future = {
        let mut session = session.clone();
        let mut is_calculating_receiver = app_state.sieve.is_calculating_rcv();
        async move {
            while let Ok(is_calculating) = is_calculating_receiver.recv().await {
                let _ = session
                    .text(
                        serde_json::to_string(&Msg::new("isCalculating", is_calculating)).unwrap(),
                    )
                    .await;
            }
        }
    };
    let redis_conn = app_state.redis_conn.clone();
    let db_conn = app_state.db_conn.clone();
    let (channels_sender, mut channels_receiver) = tokio::sync::mpsc::channel::<InputMessage>(8);
    let messages_future = {
        let mut session = session.clone();
        let mut pub_subs = HashMap::new();
        let auth = auth.clone();
        async move {
            while let Some(channel_msg) = channels_receiver.recv().await {
                match channel_msg {
                    InputMessage::SendMessage {
                        content,
                        channel_id,
                    } => {
                        let now = chrono::Utc::now().naive_utc();
                        if let Ok(msg) = (entity::message::ActiveModel {
                            user_id: Set(auth.user.id),
                            channel_id: Set(channel_id as i32),
                            created_at: Set(now),
                            updated_at: Set(now),
                            content: Set(content),
                            ..Default::default()
                        })
                        .insert(&db_conn)
                        .await
                        {
                            if let Ok(mut conn) = redis_conn.get_async_connection().await {
                                let _ = redis::cmd("PUBLISH").arg(&[&format!("/channel/{}", channel_id), &serde_json::to_string(&msg).unwrap()]).query_async::<_, ()>(&mut conn).await;
                                let _ = session
                                        .text(
                                            Msg::new(
                                                "sendMessage",
                                                serde_json::json!({ "status": "ok" }),
                                            )
                                            .to_json(),
                                        )
                                        .await;
                            }
                        }
                    }
                    InputMessage::Subscribe { channel_id } => {
                        if pub_subs.get(&channel_id).is_none() {
                            if let Ok(conn) = redis_conn.get_async_connection().await {
                                let (tx, mut rx) = tokio::sync::oneshot::channel::<()>();
                                pub_subs.insert(channel_id, tx);
                                let mut session = session.clone();
                                tokio::spawn(async move {
                                    let mut pub_sub = conn.into_pubsub();
                                    let _ =
                                        pub_sub.subscribe(format!("/channel/{}", channel_id)).await;
                                    let mut pub_sub = Box::pin(pub_sub.into_on_message());
                                    let _ = session
                                        .text(
                                            Msg::new(
                                                "subscribe",
                                                serde_json::json!({ "status": "ok" }),
                                            )
                                            .to_json(),
                                        )
                                        .await;
                                    loop {
                                        rx = {
                                            match select(pub_sub.next(), rx).await {
                                                Either::Left((msg, rx)) => {
                                                    if let Some(msg) = msg
                                                        .map(|msg| msg.get_payload::<String>().ok())
                                                        .flatten()
                                                    {
                                                        let _ = session.text(msg).await;
                                                    }
                                                    rx
                                                }
                                                Either::Right(_) => break,
                                            }
                                        };
                                    }
                                });
                            }
                        }
                    }
                    InputMessage::Unsubscribe { channel_id } => {
                        if let Some(tx) = pub_subs.remove(&channel_id) {
                            let _ = session
                                .text(
                                    Msg::new("unsubscribe", serde_json::json!({ "status": "ok" }))
                                        .to_json(),
                                )
                                .await;
                            let _ = dbg!(tx.send(()));
                        }
                    }
                }
            }
        }
    };
    tokio::spawn(messages_future);
    tokio::spawn(is_calculating_future);
    while let Some(msg) = msg_stream.next().await {
        match msg {
            Ok(ws::Message::Ping(msg)) => {
                let _ = session.pong(&msg).await;
            }
            Ok(ws::Message::Text(text)) => {
                if let Ok(input) = serde_json::from_str::<InputMessage>(&text) {
                    let _ = channels_sender.send(input).await;
                }
            }
            _ => (),
        }
    }
    session.close(None).await?;
    Ok(())
}

async fn index(
    auth: Auth,
    app_state: actix_web::web::Data<AppState>,
    req: HttpRequest,
    stream: web::Payload,
) -> Result<HttpResponse, Error> {
    let (res, session, msg_stream) = actix_ws::handle(&req, stream)?;
    tokio::task::spawn_local(ws(app_state.into_inner().clone(), Arc::new(auth), session, msg_stream));
    Ok(res)
}

pub fn config(cfg: &mut web::ServiceConfig) {
    cfg.service(web::scope("/ws").route("", web::to(index)));
}

#[derive(Serialize)]
struct Msg<'a, T: Serialize> {
    #[serde(rename = "type")]
    _type: &'a str,
    data: T,
}

#[derive(Deserialize, Serialize, Clone, Debug)]
#[serde(rename_all = "camelCase", tag = "type", content = "data")]
enum InputMessage {
    #[serde(rename_all = "camelCase")]
    SendMessage { content: String, channel_id: u32 },
    #[serde(rename_all = "camelCase")]
    Subscribe { channel_id: u32 },
    #[serde(rename_all = "camelCase")]
    Unsubscribe { channel_id: u32 },
}

impl<'a, T: Serialize> Msg<'a, T> {
    pub fn new(_type: &'a str, data: T) -> Self {
        Self { _type, data }
    }

    pub fn to_json(&self) -> String {
        serde_json::to_string(self).unwrap()
    }
}
