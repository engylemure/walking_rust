mod handlers;
mod models;
mod utils;

use actix_web::{get, web, App, HttpResponse, HttpServer, Responder};
use handlers::{channel, sieve_of_eratosthenes, user, ws};
use tracing_subscriber::fmt::format::FmtSpan;
use std::{net::SocketAddr, sync::Arc};
use tracing_actix_web::TracingLogger;
use utils::{app_state::AppState, env::EnvironmentValues};
use actix_cors::Cors;

use crate::handlers::sieve_of_eratosthenes::SieveOfEratosthenes;

#[get("/")]
async fn hello() -> impl Responder {
    HttpResponse::Ok().json(serde_json::json!({
        "message": "Hello World!"
    }))
}

#[actix_web::main]
pub async fn start() -> Result<(), Box<dyn std::error::Error>> {
    tracing_subscriber::fmt()
        .with_max_level(tracing::Level::DEBUG)
        .with_span_events(FmtSpan::NEW | FmtSpan::CLOSE)
        .init();
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
    tracing::info!("Starting App Server at: {}", socket);
    HttpServer::new(move || {
        App::new()
            .wrap(Cors::permissive().allowed_origin_fn(|_, _| true))
            .app_data(app_state.clone())
            .wrap(TracingLogger::default())
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
