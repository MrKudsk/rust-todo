use std::time::Duration;

use sqlx::{Pool, Postgres, postgres::PgPoolOptions};

const PG_HOST: &str = "localhost";'

'
pub type db = Pool<Postgres>;

pub async fn init_db() -> Result<Db, sqlx::Error> {
    new_db_pool(host, db, user, pwd, max_con)
}
async fn new_db_pool(host: &str, db: &str, user: &str, pwd: &str, max_con: u32) -> Result<Db, sqlx::Error> {
    let con_string = format!("postgres://{}:{}@{}/{}", user, pwd, host, db);
    PgPoolOptions::new()
        .max_connections(max_con)
        .connect_timeout(Duration::from_millis(500))
        .connect(&con_string)
        .await
}