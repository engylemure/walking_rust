use actix_web::{get, web, Responder, HttpResponse};
use crate::utils::app_state::AppState;

#[get("/{channel_id}")]
pub async fn get(path: web::Path<u32>, app_state: web::Data<AppState>) -> impl Responder {
    HttpResponse::Ok().finish()
}