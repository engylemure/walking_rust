mod handlers;
mod utils;
mod models;

use actix_web::{get, middleware::Logger, web, App, HttpResponse, HttpServer, Responder};
use env_logger::Env;
use handlers::{channel, sieve_of_eratosthenes, user, ws};
use log;
use std::{net::SocketAddr, sync::Arc};
use utils::{app_state::AppState, env::EnvironmentValues};

use crate::handlers::sieve_of_eratosthenes::SieveOfEratosthenes;

#[get("/")]
async fn hello() -> impl Responder {
    HttpResponse::Ok().json(serde_json::json!({
        "message": "Hello World!"
    }))
}

#[actix_web::main]
pub async fn start() -> Result<(), Box<dyn std::error::Error>> {
    env_logger::init_from_env(Env::default().default_filter_or("info"));
    let env_values = Arc::new(EnvironmentValues::init());
    let app_state = web::Data::new(
        AppState::new(
            &env_values.database_url,
            &env_values.redis_url,
            SieveOfEratosthenes::default(),
        )
        .await?,
    );
    let socket: SocketAddr = format!("[::]:{}", env_values.server_port).parse()?;
    log::info!("Starting App Server at: {}", socket);
    HttpServer::new(move || {
        App::new()
            .app_data(app_state.clone())
            .wrap(Logger::default())
            .configure(channel::config)
            .configure(user::config)
            .configure(ws::config)
            .configure(sieve_of_eratosthenes::config)
            .service(hello)
    })
    .bind(socket)?
    .run()
    .await?;
    Ok(())
}
