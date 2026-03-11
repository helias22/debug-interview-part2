// Simplified schema — relevant tables only

const users = {
  id: "integer primary key",
  name: "text not null",
  email: "text not null",
  org_id: "integer not null",
  phone_number: "text",          // Legacy column — see user_contacts
  created_at: "timestamp",
};

const user_contacts = {
  id: "integer primary key",
  user_id: "integer not null",   // FK → users.id
  contact_type: "text not null", // 'phone', 'email', 'slack'
  contact_value: "text not null",
  created_at: "timestamp",
};

const tasks = {
  id: "integer primary key",
  title: "text not null",
  assigned_to: "integer",        // FK → users.id
  org_id: "integer not null",
  status: "text not null",
  created_at: "timestamp",
};
