-- Workflows Table
CREATE TABLE IF NOT EXISTS workflows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  trigger_type TEXT NOT NULL,
  trigger_config JSONB NOT NULL,
  actions JSONB NOT NULL,
  enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Workflow Executions Table
CREATE TABLE IF NOT EXISTS workflow_executions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workflow_id UUID REFERENCES workflows(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  status TEXT NOT NULL,
  trigger_data JSONB,
  result JSONB,
  error TEXT,
  started_at TIMESTAMPTZ NOT NULL,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Scheduled Tasks Table
CREATE TABLE IF NOT EXISTS scheduled_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workflow_id UUID REFERENCES workflows(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  cron_expression TEXT NOT NULL,
  next_run_at TIMESTAMPTZ NOT NULL,
  last_run_at TIMESTAMPTZ,
  enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_tasks ENABLE ROW LEVEL SECURITY;

-- Policies for workflows
CREATE POLICY "Users can manage their workflows"
  ON workflows FOR ALL
  USING (auth.uid() = user_id);

-- Policies for executions
CREATE POLICY "Users can view their executions"
  ON workflow_executions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service can manage executions"
  ON workflow_executions FOR ALL
  TO service_role
  USING (true);

-- Policies for tasks
CREATE POLICY "Users can view their tasks"
  ON scheduled_tasks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service can manage tasks"
  ON scheduled_tasks FOR ALL
  TO service_role
  USING (true);