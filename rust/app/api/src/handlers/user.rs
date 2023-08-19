use crate::utils::{app_state::AppState, auth::Auth};
use actix_web::{cookie::Cookie, get, post, web, HttpResponse, Responder};
use entity::{user, user::Entity as User};
use sea_orm::{
    ActiveModelTrait, ActiveValue::Set, ColumnTrait, EntityTrait, QueryFilter, TransactionTrait,
};
use serde::{Deserialize, Serialize};

#[derive(Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct AuthInput {
    user_name: String,
}

#[post("/signup")]
pub async fn signup(input: web::Json<AuthInput>, app_state: web::Data<AppState>) -> impl Responder {
    let input = input.into_inner();
    let now = chrono::Utc::now().naive_utc();
    let user = user::ActiveModel {
        user_name: Set(input.user_name),
        created_at: Set(now),
        updated_at: Set(now),
        ..Default::default()
    };
    match app_state.db_conn.transaction(|txn| user.insert(txn)).await {
        Ok(user) => HttpResponse::Ok().json(user),
        Err(_) => HttpResponse::InternalServerError().finish(),
    }
}

#[post("/login")]
pub async fn login(input: web::Json<AuthInput>, app_state: web::Data<AppState>) -> impl Responder {
    let input = input.into_inner();
    match User::find()
        .filter(user::Column::UserName.eq(&input.user_name))
        .one(&app_state.db_conn)
        .await
    {
        Ok(Some(user)) => HttpResponse::Ok()
            .cookie(
                Cookie::build("userId", &user.id.to_string())
                    .path("/")
                    .finish(),
            )
            .json(user),
        Ok(None) => HttpResponse::NotFound().finish(),
        Err(_) => HttpResponse::InternalServerError().finish(),
    }
}

#[get("/me")]
pub async fn me(auth: Auth) -> impl Responder {
    HttpResponse::Ok().json(auth.user)
}

#[get("/users")]
pub async fn all(app_state: web::Data<AppState>) -> impl Responder {
    match User::find().all(&app_state.db_conn).await {
        Ok(users) => HttpResponse::Ok().json(users),
        Err(_) => HttpResponse::InternalServerError().finish(),
    }
}

pub fn config(cfg: &mut web::ServiceConfig) {
    cfg.service(signup)
        .service(me)
        .service(all)
        .service(login);
}
