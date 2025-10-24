# Coding Best Practices

> **IMPORTANT**: These best practices MUST be followed when using the MCP tools to write, modify, or review code.

---

## Table of Contents

1. [Code Quality Standards](#code-quality-standards)
2. [PHP/WordPress Best Practices](#phpwordpress-best-practices)
3. [JavaScript Best Practices](#javascript-best-practices)
4. [Database Best Practices](#database-best-practices)
5. [Security Best Practices](#security-best-practices)
6. [Performance Best Practices](#performance-best-practices)
7. [Documentation Standards](#documentation-standards)
8. [Testing Guidelines](#testing-guidelines)
9. [Git & Version Control](#git--version-control)
10. [Code Review Checklist](#code-review-checklist)

---

## Code Quality Standards

### General Principles

1. **DRY (Don't Repeat Yourself)**
   - Avoid code duplication
   - Extract repeated logic into functions/methods
   - Create reusable components

2. **KISS (Keep It Simple, Stupid)**
   - Write simple, straightforward code
   - Avoid unnecessary complexity
   - Choose clarity over cleverness

3. **SOLID Principles**
   - **S**ingle Responsibility: Each class/function should have one purpose
   - **O**pen/Closed: Open for extension, closed for modification
   - **L**iskov Substitution: Subtypes must be substitutable for their base types
   - **I**nterface Segregation: Many specific interfaces > one general interface
   - **D**ependency Inversion: Depend on abstractions, not concretions

4. **Code Readability**
   - Use meaningful variable and function names
   - Keep functions short and focused (< 50 lines)
   - Add comments for complex logic
   - Use consistent formatting

### Naming Conventions

```php
// Classes: PascalCase
class CourseBuilder {}

// Functions/Methods: camelCase or snake_case (WordPress style)
function getUserCourses() {}
function get_user_courses() {} // WordPress style

// Constants: SCREAMING_SNAKE_CASE
const MAX_UPLOAD_SIZE = 1024;

// Variables: camelCase or snake_case
$courseId = 123;
$course_id = 123; // WordPress style
```

---

## PHP/WordPress Best Practices

### WordPress Coding Standards

1. **Use WordPress Core Functions**
   ```php
   // Good ✓
   $data = wp_remote_get( $url );
   
   // Bad ✗
   $data = file_get_contents( $url );
   ```

2. **Sanitization & Validation**
   ```php
   // Always sanitize input
   $user_input = sanitize_text_field( $_POST['field'] );
   $email = sanitize_email( $_POST['email'] );
   $url = esc_url( $_POST['url'] );
   
   // Validate before use
   if ( ! is_email( $email ) ) {
       // Handle error
   }
   ```

3. **Escaping Output**
   ```php
   // Always escape output
   echo esc_html( $user_content );
   echo esc_attr( $attribute );
   echo esc_url( $link );
   echo esc_js( $javascript );
   ```

4. **Database Queries**
   ```php
   // Good ✓ - Use $wpdb with prepared statements
   global $wpdb;
   $results = $wpdb->get_results( 
       $wpdb->prepare( 
           "SELECT * FROM {$wpdb->prefix}courses WHERE id = %d", 
           $course_id 
       ) 
   );
   
   // Bad ✗ - Direct query without preparation
   $results = $wpdb->get_results( 
       "SELECT * FROM {$wpdb->prefix}courses WHERE id = $course_id" 
   );
   ```

5. **Hooks & Filters**
   ```php
   // Use descriptive hook names with plugin prefix
   do_action( 'creatorlms_course_created', $course_id );
   $title = apply_filters( 'creatorlms_course_title', $title, $course_id );
   
   // Always provide priority and argument count
   add_action( 'init', 'my_function', 10, 1 );
   add_filter( 'the_content', 'my_filter', 20, 2 );
   ```

6. **Nonce Verification**
   ```php
   // Always verify nonces for form submissions
   if ( ! isset( $_POST['nonce'] ) || ! wp_verify_nonce( $_POST['nonce'], 'action_name' ) ) {
       wp_die( 'Security check failed' );
   }
   ```

7. **Capability Checks**
   ```php
   // Always check user capabilities
   if ( ! current_user_can( 'manage_options' ) ) {
       wp_die( 'Unauthorized access' );
   }
   ```

### PHP Modern Practices

1. **Type Declarations**
   ```php
   // Use type hints
   function calculateTotal(int $quantity, float $price): float {
       return $quantity * $price;
   }
   ```

2. **Null Safety**
   ```php
   // Use null coalescing operator
   $value = $data['key'] ?? 'default';
   
   // Use null safe operator (PHP 8.0+)
   $country = $user?->getAddress()?->getCountry();
   ```

3. **Error Handling**
   ```php
   try {
       $result = riskyOperation();
   } catch (Exception $e) {
       error_log( 'Error: ' . $e->getMessage() );
       wp_send_json_error( 'Operation failed' );
   }
   ```

---

## JavaScript Best Practices

### Modern JavaScript (ES6+)

1. **Use `const` and `let`**
   ```javascript
   // Good ✓
   const API_URL = '/api/courses';
   let courseCount = 0;
   
   // Bad ✗
   var API_URL = '/api/courses';
   var courseCount = 0;
   ```

2. **Arrow Functions**
   ```javascript
   // Good ✓
   const getCourses = () => {
       return fetch(API_URL).then(res => res.json());
   };
   
   // Use for callbacks
   courses.map(course => course.title);
   ```

3. **Destructuring**
   ```javascript
   // Object destructuring
   const { title, author, price } = course;
   
   // Array destructuring
   const [first, second, ...rest] = courses;
   ```

4. **Template Literals**
   ```javascript
   // Good ✓
   const message = `Course ${title} by ${author} costs $${price}`;
   
   // Bad ✗
   const message = 'Course ' + title + ' by ' + author + ' costs $' + price;
   ```

5. **Async/Await**
   ```javascript
   // Good ✓
   async function fetchCourses() {
       try {
           const response = await fetch(API_URL);
           const data = await response.json();
           return data;
       } catch (error) {
           console.error('Error fetching courses:', error);
       }
   }
   ```

6. **Optional Chaining**
   ```javascript
   // Good ✓
   const country = user?.address?.country;
   
   // Bad ✗
   const country = user && user.address && user.address.country;
   ```

### jQuery (WordPress Context)

1. **Use `$` Safely**
   ```javascript
   (function($) {
       $(document).ready(function() {
           // Your code here
       });
   })(jQuery);
   ```

2. **Event Delegation**
   ```javascript
   // Good ✓ - Handles dynamic elements
   $(document).on('click', '.course-button', function() {
       // Handle click
   });
   
   // Bad ✗ - Only works for existing elements
   $('.course-button').click(function() {
       // Handle click
   });
   ```

---

## Database Best Practices

### WordPress Database

1. **Always Use Prepared Statements**
   ```php
   global $wpdb;
   
   // INSERT
   $wpdb->insert(
       $wpdb->prefix . 'courses',
       [
           'title' => $title,
           'author_id' => $author_id
       ],
       ['%s', '%d']
   );
   
   // UPDATE
   $wpdb->update(
       $wpdb->prefix . 'courses',
       ['title' => $new_title],
       ['id' => $course_id],
       ['%s'],
       ['%d']
   );
   
   // SELECT
   $results = $wpdb->get_results(
       $wpdb->prepare(
           "SELECT * FROM {$wpdb->prefix}courses WHERE author_id = %d",
           $author_id
       )
   );
   ```

2. **Optimize Queries**
   - Use indexes on frequently queried columns
   - Avoid `SELECT *`, specify needed columns
   - Use `LIMIT` for pagination
   - Cache expensive queries

3. **Transaction Management**
   ```php
   global $wpdb;
   
   $wpdb->query('START TRANSACTION');
   
   try {
       // Multiple database operations
       $wpdb->insert(...);
       $wpdb->update(...);
       
       $wpdb->query('COMMIT');
   } catch (Exception $e) {
       $wpdb->query('ROLLBACK');
       throw $e;
   }
   ```

---

## Security Best Practices

### Input Validation & Sanitization

1. **Never Trust User Input**
   ```php
   // Sanitize ALL input
   $username = sanitize_user( $_POST['username'] );
   $email = sanitize_email( $_POST['email'] );
   $text = sanitize_text_field( $_POST['text'] );
   $textarea = sanitize_textarea_field( $_POST['textarea'] );
   ```

2. **Validate Data Types**
   ```php
   if ( ! is_numeric( $course_id ) ) {
       wp_die( 'Invalid course ID' );
   }
   
   if ( ! filter_var( $email, FILTER_VALIDATE_EMAIL ) ) {
       wp_die( 'Invalid email address' );
   }
   ```

3. **SQL Injection Prevention**
   ```php
   // Always use $wpdb->prepare()
   $safe_query = $wpdb->prepare(
       "SELECT * FROM table WHERE id = %d AND status = %s",
       $id,
       $status
   );
   ```

4. **XSS Prevention**
   ```php
   // Escape all output
   echo esc_html( $user_input );
   echo esc_attr( $attribute );
   echo esc_url( $link );
   echo wp_kses_post( $html_content );
   ```

5. **CSRF Protection**
   ```php
   // Create nonce
   wp_nonce_field( 'course_update_action', 'course_update_nonce' );
   
   // Verify nonce
   if ( ! wp_verify_nonce( $_POST['course_update_nonce'], 'course_update_action' ) ) {
       wp_die( 'Security check failed' );
   }
   ```

### Authentication & Authorization

1. **Check User Capabilities**
   ```php
   // Always verify permissions
   if ( ! current_user_can( 'edit_courses' ) ) {
       wp_send_json_error( 'Insufficient permissions' );
   }
   ```

2. **Secure API Endpoints**
   ```php
   add_action( 'rest_api_init', function() {
       register_rest_route( 'creatorlms/v1', '/courses', [
           'methods' => 'POST',
           'callback' => 'create_course',
           'permission_callback' => function() {
               return current_user_can( 'edit_courses' );
           }
       ]);
   });
   ```

---

## Performance Best Practices

### WordPress Performance

1. **Caching**
   ```php
   // Object caching
   $courses = wp_cache_get( 'all_courses', 'creatorlms' );
   if ( false === $courses ) {
       $courses = expensive_database_query();
       wp_cache_set( 'all_courses', $courses, 'creatorlms', 3600 );
   }
   
   // Transients for cross-request caching
   $courses = get_transient( 'creatorlms_courses' );
   if ( false === $courses ) {
       $courses = expensive_database_query();
       set_transient( 'creatorlms_courses', $courses, HOUR_IN_SECONDS );
   }
   ```

2. **Query Optimization**
   ```php
   // Cache post queries
   $courses = new WP_Query([
       'post_type' => 'course',
       'posts_per_page' => 10,
       'no_found_rows' => true, // Skip counting if pagination not needed
       'update_post_meta_cache' => false, // Skip meta if not needed
       'update_post_term_cache' => false, // Skip terms if not needed
   ]);
   ```

3. **Asset Optimization**
   ```php
   // Enqueue scripts in footer
   wp_enqueue_script( 'my-script', $url, ['jquery'], '1.0', true );
   
   // Conditional loading
   if ( is_singular( 'course' ) ) {
       wp_enqueue_script( 'course-script' );
   }
   ```

### Database Performance

1. **Use Indexes**
   ```sql
   CREATE INDEX idx_course_author ON wp_courses(author_id);
   CREATE INDEX idx_course_status ON wp_courses(status);
   ```

2. **Pagination**
   ```php
   // Always limit results
   $wpdb->get_results( $wpdb->prepare(
       "SELECT * FROM courses LIMIT %d OFFSET %d",
       $per_page,
       $offset
   ));
   ```

---

## Documentation Standards

### Code Comments

1. **PHPDoc Blocks**
   ```php
   /**
    * Create a new course
    *
    * @since 1.0.0
    * @param string $title Course title
    * @param int    $author_id Author user ID
    * @return int|WP_Error Course ID on success, WP_Error on failure
    */
   function create_course( $title, $author_id ) {
       // Implementation
   }
   ```

2. **Inline Comments**
   ```php
   // Calculate total price with discount
   $total = $price * $quantity * (1 - $discount);
   
   // TODO: Add tax calculation
   // FIXME: Handle negative quantities
   ```

3. **JSDoc Comments**
   ```javascript
   /**
    * Fetch courses from API
    * @param {number} page - Page number
    * @param {number} perPage - Items per page
    * @returns {Promise<Array>} Array of course objects
    */
   async function fetchCourses(page, perPage) {
       // Implementation
   }
   ```

---

## Testing Guidelines

### Unit Testing

1. **Test Coverage**
   - Aim for 80%+ code coverage
   - Test all critical functions
   - Test edge cases and error conditions

2. **Test Structure**
   ```php
   class CourseTest extends WP_UnitTestCase {
       public function test_course_creation() {
           // Arrange
           $data = ['title' => 'Test Course'];
           
           // Act
           $course_id = create_course( $data );
           
           // Assert
           $this->assertIsInt( $course_id );
           $this->assertGreaterThan( 0, $course_id );
       }
   }
   ```

### Integration Testing

1. **Test API Endpoints**
2. **Test Database Operations**
3. **Test User Interactions**

---

## Git & Version Control

### Commit Messages

```
feat: Add course enrollment feature
fix: Resolve payment gateway timeout issue
docs: Update API documentation
refactor: Optimize database queries
test: Add unit tests for enrollment
chore: Update dependencies
```

### Branch Naming

```
feature/course-builder
fix/payment-bug
hotfix/critical-security
refactor/database-optimization
```

### Best Practices

1. **Commit Early, Commit Often**
2. **Write Descriptive Commit Messages**
3. **Keep Commits Atomic**
4. **Review Before Pushing**
5. **Never Commit Sensitive Data**

---

## Code Review Checklist

### Functionality
- [ ] Code works as expected
- [ ] All edge cases handled
- [ ] Error handling implemented
- [ ] Tests pass

### Code Quality
- [ ] Code is readable and well-structured
- [ ] Follows naming conventions
- [ ] No code duplication
- [ ] Comments added where needed

### Security
- [ ] Input is sanitized
- [ ] Output is escaped
- [ ] SQL queries use prepared statements
- [ ] Nonces verified
- [ ] Capabilities checked

### Performance
- [ ] No unnecessary database queries
- [ ] Caching implemented where appropriate
- [ ] Assets loaded conditionally
- [ ] No performance bottlenecks

### WordPress Specific
- [ ] WordPress coding standards followed
- [ ] Core functions used appropriately
- [ ] Hooks and filters used correctly
- [ ] Backwards compatibility maintained

---

## Summary

These best practices should be **strictly followed** when using the MCP tools to:
- Write new code
- Modify existing code
- Review code changes
- Create pull requests
- Debug issues

**Remember**: Quality code is maintainable code. Take the time to do it right.
