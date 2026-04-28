# Security Specification: RapidRelief AI

## Data Invariants
1. **Incident Ownership**: Only the original reporter or an authorized responder/admin can modify an incident status. 
2. **Citizen Integrity**: Users cannot elevate their own role to 'responder' or 'admin'.
3. **Geo-Precision**: Latitude and longitude must be valid numerical coordinates.
4. **AI Immutability**: AI-generated confidence scores and descriptions cannot be modified by the citizen reporter after submission.

## The "Dirty Dozen" Payloads (Denial Expected)
1. **Identity Spoofing**: Attempt to create an incident with `reporterId` different from `request.auth.uid`.
2. **Privilege Escalation**: Citizen attempting to update a user profile to `role: 'admin'`.
3. **Status Hijacking**: Citizen attempting to set `status: 'verified'` directly.
4. **Resource Poisoning**: Incident with 1MB string in `description`.
5. **ID Injection**: Create incident with document ID containing illegal characters or excessive length.
6. **Time Spoofing**: Create incident with `timestamp` set to a future date instead of `request.time`.
7. **Coordinate Injection**: Attempt to set `latitude: 999`.
8. **Field Shadowing**: Adding a hidden field `isVerified: true` during report submission.
9. **Relational Break**: Delete an incident that the user does not own.
10. **Query Scraping**: Attempting a `list` query without a filter for `reporterId` or being an admin.
11. **Bulk Update**: Attempting to update `reportCount` and `status` in a single unverified write.
12. **Metadata Tampering**: Attempting to change the `createdAt` timestamp of a user profile.

## Security Rules Plan
- Implement `isValidIncident` and `isValidUser` helpers.
- Use `affectedKeys().hasOnly()` for distinct actions (Report, Verify, Join).
- Default-deny catch-all rule.
