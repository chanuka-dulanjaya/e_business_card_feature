# Application Logs

This directory contains application logs for debugging and monitoring.

## Log Files

- `application.log` - Main application log file (JSON format)

## Log Format

Each log entry is a JSON object with the following structure:

```json
{
  "timestamp": "2026-01-08T12:00:00.000Z",
  "level": "info|warn|error|debug",
  "message": "Log message",
  "...additionalMetadata": "..."
}
```

## Log Levels

- **info**: General information (successful operations, etc.)
- **warn**: Warning messages (failed login attempts, etc.)
- **error**: Error messages (exceptions, failures, etc.)
- **debug**: Detailed debugging information

## Viewing Logs

### View recent logs:
```bash
tail -f logs/application.log
```

### View last 100 lines:
```bash
tail -100 logs/application.log
```

### Search for specific events:
```bash
grep "Login attempt" logs/application.log
grep "error" logs/application.log | tail -20
```

### Pretty print JSON logs:
```bash
tail -20 logs/application.log | while read line; do echo $line | jq .; done
```

## Note

Log files are excluded from git (in .gitignore) to prevent sensitive data from being committed.
