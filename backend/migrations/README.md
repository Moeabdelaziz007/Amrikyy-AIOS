# Database Migrations

## How to Run

Execute these SQL files in Supabase SQL Editor in order:

1. `001_user_integrations.sql` - OAuth tokens storage
2. `002_workflows.sql` - Workflow engine tables
3. `003_telegram_link_codes.sql` - Telegram bot linking

## Tables Created

- `user_integrations` - Stores OAuth tokens for Gmail, Calendar, Drive
- `workflows` - Workflow definitions
- `workflow_executions` - Execution history
- `scheduled_tasks` - Cron scheduled tasks
- `telegram_link_codes` - Telegram account linking codes

## RLS Policies

All tables have Row Level Security enabled with appropriate policies.