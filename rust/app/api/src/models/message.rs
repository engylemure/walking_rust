use chrono::NaiveDateTime as DateTime;
use entity::user::Model as User;
use serde::Deserialize;

#[derive(Deserialize)]
pub struct Message {
    pub id: i32,
    pub content: String,
    pub channel_id: i32,
    pub created_at: DateTime,
    pub updated_at: DateTime,
    pub user: User,
}

impl From<(entity::message::Model, User)> for Message {
    fn from(
        (
            entity::message::Model {
                id,
                content,
                channel_id,
                created_at,
                updated_at,
                ..
            },
            User,
        ): (entity::message::Model, User),
    ) -> Self {
        Self {
            id,
            content,
            channel_id,
            created_at,
            updated_at,
            user: User,
        }
    }
}

impl Message {
    pub fn to_json(&self) -> String {
        serde_json::to_string(&self).unwrap()
    }
}
