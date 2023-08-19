use std::pin::Pin;

use crate::utils::app_state::AppState;
use actix_web::{dev::Payload, web, Error, FromRequest, HttpRequest, error};
use futures_util::Future;
use sea_orm::EntityTrait;

pub struct Auth {
    pub user: entity::user::Model,
}

impl FromRequest for Auth {
    type Error = Error;
    type Future = Pin<Box<dyn Future<Output = Result<Self, Self::Error>>>>;

    // Required method
    fn from_request(req: &HttpRequest, _payload: &mut Payload) -> Self::Future {
        let app_state = req.app_data::<web::Data<AppState>>().cloned().unwrap();
        let user_id = req
            .cookie("userId")
            .map(|cookie| cookie.value().parse::<i32>().ok())
            .flatten();
        Box::pin(async move {
            if let Some(user_id) = user_id {
                if let Ok(Some(user)) = entity::user::Entity::find_by_id(user_id)
                    .one(&app_state.db_conn)
                    .await
                {
                    return Ok(Self { user });
                }
            }
            Err(error::ErrorUnauthorized("Invalid credentials"))
        })
    }
}
