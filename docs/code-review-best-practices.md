# Code Review Best Practices

> **IMPORTANT**: Follow these code review guidelines when reviewing pull requests in CreatorLMS projects.

---

## Table of Contents

1. [Code Review Purpose](#code-review-purpose)
2. [Before Starting Review](#before-starting-review)
3. [What to Review](#what-to-review)
4. [Review Checklist](#review-checklist)
5. [Providing Feedback](#providing-feedback)
6. [Common Issues to Look For](#common-issues-to-look-for)
7. [Best Practices](#best-practices)

---

## Code Review Purpose

### Why Code Reviews Matter

- **Quality Assurance** - Catch bugs before they reach production
- **Knowledge Sharing** - Team members learn from each other
- **Consistency** - Maintain coding standards across the codebase
- **Security** - Identify potential security vulnerabilities
- **Maintainability** - Ensure code is understandable and maintainable

### Goals of Code Review

1. ✅ Verify functionality works as intended
2. ✅ Ensure code follows best practices
3. ✅ Identify potential bugs or edge cases
4. ✅ Improve code quality and readability
5. ✅ Share knowledge within the team

---

## Before Starting Review

### Preparation

1. **Understand the Context**
   - Read the PR description
   - Check the linked issue/ticket
   - Understand the problem being solved

2. **Review the Changes**
   - Check files changed
   - Review the diff
   - Look at the overall scope

3. **Set Up Environment**
   - Pull the branch locally if needed
   - Test the changes yourself
   - Verify tests pass

### Time Management

- ⏱️ Allocate dedicated time for reviews
- ⏱️ Don't rush through reviews
- ⏱️ Take breaks for large PRs
- ⏱️ Request smaller PRs if too large (> 400 lines)

---

## What to Review

### Code Quality

1. **Readability**
   - [ ] Code is easy to understand
   - [ ] Variable/function names are descriptive
   - [ ] Logic is clear and straightforward
   - [ ] Comments explain complex sections

2. **Maintainability**
   - [ ] Code follows DRY principle
   - [ ] Functions are focused and short
   - [ ] No code duplication
   - [ ] Easy to modify/extend

3. **Standards Compliance**
   - [ ] Follows team coding standards
   - [ ] WordPress coding standards (for WP code)
   - [ ] Consistent formatting
   - [ ] Proper naming conventions

### Functionality

1. **Requirements**
   - [ ] Solves the stated problem
   - [ ] All requirements met
   - [ ] No unnecessary features added
   - [ ] Edge cases handled

2. **Logic**
   - [ ] Algorithm is correct
   - [ ] No logical errors
   - [ ] Handles errors appropriately
   - [ ] Input validation present

3. **Testing**
   - [ ] Tests are included
   - [ ] Tests cover main scenarios
   - [ ] Tests cover edge cases
   - [ ] All tests pass

### Security

1. **Input Validation**
   - [ ] All user input is validated
   - [ ] Input is sanitized
   - [ ] Type checking is present
   - [ ] Range checking where needed

2. **Output Escaping**
   - [ ] All output is escaped
   - [ ] Correct escaping function used
   - [ ] No XSS vulnerabilities
   - [ ] No HTML injection possible

3. **Authentication & Authorization**
   - [ ] User permissions checked
   - [ ] Nonces verified (WordPress)
   - [ ] API endpoints secured
   - [ ] No privilege escalation possible

4. **Database Security**
   - [ ] Prepared statements used
   - [ ] No SQL injection possible
   - [ ] Transactions used appropriately
   - [ ] Data integrity maintained

### Performance

1. **Database**
   - [ ] Queries are optimized
   - [ ] No N+1 query problems
   - [ ] Indexes used appropriately
   - [ ] Caching implemented where needed

2. **Assets**
   - [ ] Scripts/styles loaded conditionally
   - [ ] Assets are minified (production)
   - [ ] No unnecessary dependencies
   - [ ] Lazy loading where appropriate

3. **Algorithms**
   - [ ] Efficient algorithms used
   - [ ] No unnecessary loops
   - [ ] Time complexity acceptable
   - [ ] Memory usage reasonable

---

## Review Checklist

### General Code Review Checklist

#### Design & Architecture
- [ ] Changes fit the overall architecture
- [ ] No over-engineering
- [ ] Follows SOLID principles
- [ ] Appropriate design patterns used

#### Implementation
- [ ] Code works as expected
- [ ] No obvious bugs
- [ ] Error handling is proper
- [ ] Edge cases are handled

#### Testing
- [ ] Unit tests included
- [ ] Integration tests if needed
- [ ] Tests are meaningful
- [ ] Test coverage is adequate

#### Documentation
- [ ] Code is self-documenting
- [ ] Comments added where needed
- [ ] PHPDoc/JSDoc blocks present
- [ ] README updated if needed

#### WordPress Specific
- [ ] Uses WordPress core functions
- [ ] Hooks/filters used correctly
- [ ] Translation ready (i18n)
- [ ] Backwards compatible

---

## Providing Feedback

### Communication Guidelines

#### Be Constructive
```
❌ Bad: "This code is terrible"
✅ Good: "Consider refactoring this to improve readability. For example: [suggestion]"
```

#### Be Specific
```
❌ Bad: "Fix this"
✅ Good: "This function should validate the email parameter before using it. Use sanitize_email()."
```

#### Explain the "Why"
```
❌ Bad: "Change this"
✅ Good: "Using prepared statements prevents SQL injection. Replace with $wpdb->prepare()."
```

#### Suggest Solutions
```
❌ Bad: "This won't work"
✅ Good: "This might cause issues with large datasets. Consider adding pagination: [code example]"
```

### Feedback Categories

1. **🔴 Critical** - Must be fixed (security, bugs)
2. **🟡 Important** - Should be fixed (best practices, performance)
3. **🟢 Nice to Have** - Optional improvements (readability, minor refactoring)
4. **💡 Question** - Asking for clarification

### Example Feedback

#### Security Issue (Critical)
```
🔴 CRITICAL: User input is not sanitized on line 45.
This creates an XSS vulnerability.

Replace:
echo $_POST['user_name'];

With:
echo esc_html( sanitize_text_field( $_POST['user_name'] ) );
```

#### Performance Concern (Important)
```
🟡 IMPORTANT: This query runs inside a loop (line 78).
This will cause N+1 query problem with many users.

Consider fetching all user data in a single query before the loop.
```

#### Code Style (Nice to Have)
```
🟢 SUGGESTION: This function is quite long (150 lines).
Consider breaking it into smaller, focused functions for better readability.
```

---

## Common Issues to Look For

### 1. Security Vulnerabilities

```php
// ❌ SQL Injection
$wpdb->query( "SELECT * FROM users WHERE id = " . $_GET['id'] );

// ✅ Fixed
$wpdb->get_results( $wpdb->prepare( 
    "SELECT * FROM users WHERE id = %d", 
    absint( $_GET['id'] ) 
) );
```

```php
// ❌ XSS Vulnerability
echo $_POST['name'];

// ✅ Fixed
echo esc_html( sanitize_text_field( $_POST['name'] ) );
```

### 2. Performance Issues

```php
// ❌ N+1 Query Problem
foreach ( $posts as $post ) {
    $author = get_user_by( 'id', $post->author_id ); // Query in loop
}

// ✅ Fixed
$author_ids = wp_list_pluck( $posts, 'author_id' );
$authors = get_users( ['include' => $author_ids] );
$authors_map = [];
foreach ( $authors as $author ) {
    $authors_map[$author->ID] = $author;
}
```

### 3. Logic Errors

```php
// ❌ Incorrect condition
if ( $status = 'active' ) { // Assignment instead of comparison

// ✅ Fixed
if ( 'active' === $status ) { // Yoda condition prevents accidental assignment
```

### 4. Missing Error Handling

```javascript
// ❌ No error handling
async function fetchData() {
    const response = await fetch(url);
    return response.json();
}

// ✅ Fixed
async function fetchData() {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Failed to fetch data:', error);
        throw error;
    }
}
```

---

## Best Practices

### For Reviewers

1. **Be Respectful**
   - Critique code, not the person
   - Use "we" instead of "you"
   - Acknowledge good work

2. **Be Timely**
   - Review within 24 hours
   - Don't block progress unnecessarily
   - Request changes if major issues found

3. **Be Thorough**
   - Don't just approve without reading
   - Test the changes locally
   - Consider the bigger picture

4. **Be Helpful**
   - Provide code examples
   - Share documentation links
   - Offer to pair program for complex issues

### For Authors

1. **Make Reviewing Easy**
   - Keep PRs small and focused
   - Write clear descriptions
   - Add comments for complex logic
   - Include screenshots/videos

2. **Respond to Feedback**
   - Address all comments
   - Ask questions if unclear
   - Explain your reasoning when needed
   - Thank reviewers for their time

3. **Self-Review First**
   - Review your own code before submitting
   - Run tests locally
   - Check coding standards
   - Verify no debug code left

### Review Response Time

- 🟢 **Small PRs** (< 50 lines): Same day
- 🟡 **Medium PRs** (50-200 lines): Within 24 hours
- 🔴 **Large PRs** (> 200 lines): Within 48 hours or request split

---

## Review Workflow

### 1. Initial Review
- Read the PR description
- Check the overall approach
- Look for major issues
- Approve, request changes, or comment

### 2. Re-Review
- Verify requested changes were made
- Check if new issues were introduced
- Approve if everything looks good

### 3. Approval
- All comments addressed
- Tests pass
- No blocking issues
- Code meets quality standards

---

## Code Review Comments Template

### Suggesting Change
```markdown
**File:** `includes/class-course.php`
**Line:** 45

**Issue:** Missing input validation

**Current:**
```php
$course_id = $_POST['course_id'];
```

**Suggested:**
```php
$course_id = isset( $_POST['course_id'] ) ? absint( $_POST['course_id'] ) : 0;
if ( ! $course_id ) {
    return new WP_Error( 'invalid_course_id', 'Invalid course ID' );
}
```

**Reason:** Prevents potential security issues and ensures data integrity.
```

### Asking Question
```markdown
**Question:** Why did you choose approach A over approach B?

I'm curious about the reasoning here. Both seem valid, but wondering if there's a specific advantage.
```

### Praising Good Code
```markdown
✨ Nice work on the caching implementation! This will significantly improve performance.
```

---

## Summary

**Remember:**
- Code reviews improve code quality
- Be constructive and helpful
- Security and functionality are top priorities
- Share knowledge and learn from each other

**Before Approving:**
- ✅ Code works correctly
- ✅ Follows best practices
- ✅ No security issues
- ✅ Tests included
- ✅ Documentation updated

---

> **Note**: Replace this content with the actual content from your "Code Review Best Practice.pdf" file.
> After replacing, restart Claude Desktop to load the new documentation.
