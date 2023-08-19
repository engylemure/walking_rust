use actix_web::{get, post, web, Responder, HttpResponse};
use crate::utils::app_state::AppState;
use entity::channel::Entity as Channel;
use sea_orm::{EntityTrait, ActiveModelTrait, ActiveValue::Set, TransactionTrait};
use serde::Deserialize;

#[get("/{channel_id}")]
pub async fn get(path: web::Path<u32>, app_state: web::Data<AppState>) -> impl Responder {
    match Channel::find_by_id(*path as i32).one(&app_state.db_conn).await {
      Ok(Some(channel)) => HttpResponse::Ok().json(channel),
      Ok(None) => HttpResponse::NotFound().finish(),
      Err(_) => HttpResponse::InternalServerError().finish(),
    }
}

#[get("")]
pub async fn all(app_state: web::Data<AppState>) -> impl Responder {
  match Channel::find().all(&app_state.db_conn).await {
    Ok(channels) => HttpResponse::Ok().json(channels),
    Err(_) => HttpResponse::InternalServerError().finish()
  }
}

#[derive(Deserialize)]
pub struct CreateChannelInput {
  pub name: String
}

#[post("")]
pub async fn create(input: web::Json<CreateChannelInput>, app_state: web::Data<AppState>) -> impl Responder {
  let input = input.into_inner();
  let now = chrono::Utc::now().naive_utc();
  let channel = entity::channel::ActiveModel {
      name: Set(input.name),
      created_at: Set(now),
      updated_at: Set(now),
      ..Default::default()
  };
  match app_state.db_conn.transaction(|tx| channel.insert(tx)).await {
    Ok(channel) => { HttpResponse::Ok().json(channel) },
    Err(_) => HttpResponse::InternalServerError().finish()
  }
}

pub fn config(cfg: &mut web::ServiceConfig) {
  cfg.service(
    web::scope("/channels")
        .service(all)  
        .service(create)
        .service(get)
  );
}