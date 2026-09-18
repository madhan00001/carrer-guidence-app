# Career Profile: Database Administrator (DBA)

## 1. Role Overview
A Database Administrator ensures that relational and NoSQL databases operate efficiently, securely, and without downtime. DBAs manage schema designs, tuning, backups, replication, high-availability failovers, and storage optimization.

## 2. Core Responsibilities
- Monitor and tune query performance using execution plans and index optimizations.
- Implement disaster recovery policies, automated daily backups, and point-in-time recovery (PITR).
- Manage database security, user privileges, encryption at rest and in transit.
- Configure primary-replica clustering, sharding, and high availability (HA).
- Migrate data schemas with zero application downtime.

## 3. Required Technical Skills & Languages
- **RDBMS:** PostgreSQL, MySQL, Oracle Database, Microsoft SQL Server.
- **NoSQL / Cache:** MongoDB, Redis, Cassandra.
- **Query Optimization:** EXPLAIN ANALYZE, B-Tree & GIN indexes, query caching, partition strategies.
- **Operating Systems & Scripting:** Linux, Bash, Python, SQL/PL-SQL.
- **Replication & HA:** Streaming replication, PgBouncer connection pooling, Patroni.

## 4. Required Soft Skills
- High vigilance and extreme discipline with production data mutations.
- Patient root-cause debugging under high concurrency incidents.
- Communication with backend developers to guide optimal schema design.

## 5. Industry Certifications
- PostgreSQL Certified Professional (Easiest & most open source standard)
- Oracle Certified Professional, MySQL Database Administrator
- AWS Certified Database - Specialty
- Microsoft Certified: Azure Database Administrator Associate

## 6. Recommended Learning Resources & Courses
- "Designing Data-Intensive Applications" by Martin Kleppmann
- "Use The Index, Luke!" by Markus Winand (SQL performance tuning guide)
- Stanford Online Database Courses (Lagunita)
- PostgreSQL Official Documentation & Internals Guide

## 7. Recommended Portfolio Projects
1. **High-Availability PostgreSQL Cluster with Failover:** Dockerized primary-standby replication with PgBouncer connection pooling and automated health probe.
2. **Query Performance Benchmarking Suite:** Python benchmark running complex joins against 10-million row synthetic tables, comparing before/after indexing.
3. **Automated Database Backup & Restore Verification Script:** Bash daemon performing incremental pg_dump, uploading to S3, and testing restore in an isolated sandbox.

## 8. Interview Topics & Preparation Checklist
- ACID properties and isolation levels (Read Committed, Repeatable Read, Serializable).
- Index internals (B-Tree, Hash, GIN, GiST) and when NOT to index.
- Deadlock detection and resolution strategies.
- Designing a sharding strategy for horizontally partitioned data.
