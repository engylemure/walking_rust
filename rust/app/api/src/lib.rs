mod utils;
mod handlers;

use actix_web::{get, middleware::Logger, web, App, HttpResponse, HttpServer, Responder};
use env_logger::Env;
use log;
use std::{env, net::SocketAddr, sync::Arc};
use utils::{app_state::AppState, env::EnvironmentValues};

#[get("/")]
async fn hello() -> impl Responder {
    HttpResponse::Ok().json(serde_json::json!({
        "message": "Hello World!"
    }))
}


#[tokio::main]
pub async fn start() -> Result<(), Box<dyn std::error::Error>> {
    env_logger::init_from_env(Env::default().default_filter_or("info"));
    let env_values = Arc::new(EnvironmentValues::init());
    let app_state = web::Data::new(AppState::new(&env_values.database_url, &env_values.redis_url).await?);
    let socket: SocketAddr = format!("[::]:{}", env_values.server_port).parse()?;
    log::info!("Starting App Server at: {}", socket);
    HttpServer::new(move || {
        App::new()
            .app_data(app_state.clone())
            .wrap(Logger::default())
            .service(hello)
    })
    .bind(socket)?
    .run()
    .await?;
    Ok(())
}
