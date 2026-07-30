alter table public.members
  add column if not exists netcash_account_reference text;

create index if not exists idx_members_netcash_account_reference
  on public.members(netcash_account_reference);
