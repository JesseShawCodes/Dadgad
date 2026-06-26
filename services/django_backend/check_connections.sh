while true; do
  PGPASSWORD=postgres psql -h 127.0.0.1 -U postgres -d postgres -c "SELECT pid, usename, datname, state, query FROM pg_stat_activity WHERE datname = 'test_maddness';"
  sleep 1
done
