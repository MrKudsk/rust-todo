use super::{Todo, TodoMac};
use crate::model;
use crate::model::db::init_db;

#[tokio::test]
async fn model_todo_create() -> Result<(), Box<dyn std::error::Error>> {
    // FIXTURE
    let db = init_db().await?;

}
