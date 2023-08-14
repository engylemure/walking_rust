use actix_web::{get, web};

#[get("/{channel_id}")]
pub async fn get(path: web::Path<u32>, app_state: web::Data<AppState>) -> impl Responder {
    
}