use chrono::NaiveDateTime as DateTime;
use entity::user::Model as UserModel;
use entity::message::Model as MessageModel;
use entity::channel::Model as ChannelModel;
use serde::Serialize;

use super::Message;

#[derive(Serialize)]
pub struct Channel {
    pub id: i32,
    pub name: String,
    pub created_at: DateTime,
    pub updated_at: DateTime,
    pub messages: Vec<Message>,
}

impl From<(ChannelModel, Vec<(MessageModel, UserModel)>)> for Channel {
    fn from(
        (
            ChannelModel {
                id,
                name,
                created_at,
                updated_at,
                ..
            },
            messages,
        ): (ChannelModel, Vec<(MessageModel, UserModel)>),
    ) -> Self {
        Self {
            id,
            name,
            created_at,
            updated_at,
            messages: messages.into_iter().map(Message::from).collect(),
        }
    }
}

impl Channel {
    pub fn to_json(&self) -> String {
        serde_json::to_string(&self).unwrap()
    }
}
