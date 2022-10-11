use super::db::Db;
use crate::model;
use crate::security::UserCtx;
use sqlb::{HasFields, Raw};

#[derive(sqlx::FromRow, Debug, Clone)]
pub struct Todo {
    pub id: i64,
    pub cid: i64, // creator id
    pub title: String,
    pub status: TodoStatus,
} 

#[derive(sqlb::Fields, Default, Clone)]
pub struct TodoPatch {
    pub title: Option<String>,
    pub status: Option<TodoStatus>,
}

#[derive(sqlx::Type, Debug, Clone, PartialEq, Eq)]
#[sqlx(type_name = "todo_status_enum")]
#[sqlx(rename_all = "lowercase")]
pub enum TodoStatus {
    Open,
    Close,
}
sqlb::bindable!(TodoStatus);

pub struct TodoMac;

impl TodoMac {
    const TABLE: &'static str = "todo";
    const COLUMNS: &'static [&'static str] = &["id", "cid", "title", "status"];
}

impl TodoMac {
    pub async fn create(db: &Db, utx: &UserCtx, data: TodoPatch) -> Result<Todo, model::Error> {
        // let sql = "INSERT INTO todo (cid, title) VALUES ($1, $2) RETURNING id, cid, title, status";
        // let query = sqlx::query_as::<_, Todo>(&sql)
        //    .bind(123 as i64)
        //    .bind(data.title.unwrap_or_else(|| "untitled".to_string()));
        let mut fields = data.fields();
        fields.push(("cid", utx.user_id).into());
        let sb = sqlb::insert()
            .table(Self::TABLE)
            .data(fields)
            .returning(Self::COLUMNS);

        let todo = sb.fetch_one(db).await?;

        Ok(todo)
    }

    pub async fn get(db: &Db, _utx: &UserCtx, id: i64) -> Result<Todo, model::Error> {
        let sb = sqlb::select().table(Self::TABLE).columns(Self::COLUMNS).and_where_eq("id", id);

        let todo = sb.fetch_one(db).await?;

        Ok(todo)
    }

    pub async fn list(db: &Db, _utx: &UserCtx) -> Result<Vec<Todo>, model::Error> {
        //let sql = "SELECT id, cid, title, status FROM todo ORDER BY id DESC";
        
        // build the sqlx-query
        //let query = sqlx::query_as(&sql);
        let sb = sqlb::select().table(Self::TABLE).columns(Self::COLUMNS).order_by("!id");
        // execute the query
        let todos = sb.fetch_all(db).await?;
        
        Ok(todos)
    }
}

#[cfg(test)]
#[path = "../test/model_todo.rs"]
mod tests;
