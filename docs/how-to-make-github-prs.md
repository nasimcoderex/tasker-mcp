# How to Make GitHub Pull Requests

> **Step-by-step guide for creating pull requests on GitHub for CreatorLMS projects**

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Creating a Pull Request](#creating-a-pull-request)
3. [PR Description Best Practices](#pr-description-best-practices)
4. [After Creating PR](#after-creating-pr)
5. [Handling Review Feedback](#handling-review-feedback)
6. [Merging Your PR](#merging-your-pr)
7. [Common Issues](#common-issues)

---

## Prerequisites

Before creating a PR, ensure you have:

### 1. Git Setup
```bash
# Configure Git
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"

# Verify configuration
git config --list
```

### 2. GitHub Account
- GitHub account created
- Added to CODEREXLTD organization
- SSH key added to GitHub (optional but recommended)

### 3. Repository Access
```bash
# Clone repository
git clone https://github.com/CODEREXLTD/creatorlms-pro.git

# Or if already cloned, update
cd creatorlms-pro
git pull origin develop
```

---

## Creating a Pull Request

### Step 1: Create a Feature Branch

```bash
# Make sure you're on develop and updated
git checkout develop
git pull origin develop

# Create and switch to new branch
git checkout -b feature/your-feature-name
```

**Branch Naming:**
- `feature/` - New features
- `fix/` - Bug fixes
- `hotfix/` - Critical fixes
- `refactor/` - Code improvements
- `docs/` - Documentation updates

### Step 2: Make Your Changes

```bash
# Edit files as needed
# ...

# Check what changed
git status
git diff
```

### Step 3: Commit Your Changes

```bash
# Stage specific files
git add path/to/file.php

# Or stage all changes
git add .

# Commit with descriptive message
git commit -m "feat: Add course enrollment feature"

# Or for detailed commit
git commit -m "feat: Add course enrollment feature

- Implement enrollment validation
- Add email notifications
- Update database schema
- Add unit tests

Closes #123"
```

### Step 4: Push to GitHub

```bash
# First time pushing this branch
git push -u origin feature/your-feature-name

# Subsequent pushes
git push
```

### Step 5: Create PR on GitHub

#### Method 1: GitHub Web Interface

1. **Go to repository on GitHub**
   - Navigate to https://github.com/CODEREXLTD/creatorlms-pro

2. **Click "Compare & pull request"**
   - GitHub often shows a banner with this button after pushing

3. **Or manually create PR:**
   - Click "Pull requests" tab
   - Click "New pull request"
   - Select base: `develop` (usually)
   - Select compare: `feature/your-feature-name`
   - Click "Create pull request"

#### Method 2: GitHub CLI (Optional)

```bash
# Install GitHub CLI
# macOS: brew install gh

# Authenticate
gh auth login

# Create PR
gh pr create --title "feat: Add course enrollment" \
             --body "Description of changes" \
             --base develop
```

---

## PR Description Best Practices

### Template

```markdown
## 📝 Description
Brief description of what this PR does and why

## 🎯 Type of Change
- [ ] 🆕 New feature
- [ ] 🐛 Bug fix
- [ ] 💥 Breaking change
- [ ] 📚 Documentation update
- [ ] ♻️ Code refactoring
- [ ] ⚡ Performance improvement

## 🔧 Changes Made
- First change
- Second change
- Third change

## 🧪 Testing Instructions
1. Go to...
2. Click on...
3. Verify that...

**Expected Result:** Description of expected outcome

## 📸 Screenshots (if applicable)
[Add before/after screenshots]

## ✅ Checklist
- [ ] Code follows project coding standards
- [ ] Self-reviewed the code
- [ ] Added comments for complex code
- [ ] Updated documentation
- [ ] Added/updated tests
- [ ] All tests pass locally
- [ ] No console errors or warnings
- [ ] Checked for breaking changes

## 🔗 Related Issues
Fixes #123
Related to #456
Part of #789

## 📌 Additional Notes
Any other information reviewers should know
```

### Real Example

```markdown
## 📝 Description
Adds a new course enrollment system that allows students to enroll in courses with validation and email notifications.

## 🎯 Type of Change
- [x] 🆕 New feature

## 🔧 Changes Made
- Added enrollment form component
- Implemented server-side validation
- Added email notification on successful enrollment
- Created database table for enrollments
- Added unit tests for enrollment logic

## 🧪 Testing Instructions
1. Log in as a student
2. Navigate to any course page
3. Click "Enroll Now" button
4. Fill in the enrollment form
5. Submit the form

**Expected Result:** 
- Success message displayed
- Student receives confirmation email
- Enrollment appears in student dashboard

## 📸 Screenshots
![Enrollment Form](https://example.com/screenshot.png)

## ✅ Checklist
- [x] Code follows WordPress coding standards
- [x] Self-reviewed the code
- [x] Added PHPDoc comments
- [x] Updated API documentation
- [x] Added unit tests
- [x] All tests pass (23 passed, 0 failed)
- [x] No PHP or JavaScript errors
- [x] Backwards compatible

## 🔗 Related Issues
Fixes #234 - Add course enrollment feature
Related to #235 - Email notification system

## 📌 Additional Notes
This PR requires the email notification system (PR #235) to be merged first.
```

---

## After Creating PR

### 1. Automatic Checks

Wait for automated checks to complete:
- ✅ **CI/CD Tests** - Unit tests, integration tests
- ✅ **Code Quality** - Linting, code standards
- ✅ **Security Scans** - Vulnerability checks

### 2. Request Reviewers

- Add team members as reviewers
- Tag specific people if needed
- Add labels (feature, bug, high-priority, etc.)

### 3. Link to Project Board

- Add to project board if using GitHub Projects
- Update issue status

### 4. Monitor PR

- Watch for review comments
- Respond to questions
- Fix any failing checks

---

## Handling Review Feedback

### Responding to Comments

#### 1. Acknowledge Feedback
```markdown
Thanks for the review! I'll address these points:
1. ✅ Fixed the validation issue
2. ✅ Added error handling
3. 🤔 Question about the caching approach - can you clarify?
```

#### 2. Make Requested Changes

```bash
# Make changes based on feedback
# ... edit files ...

# Commit changes
git add .
git commit -m "fix: Address review feedback

- Add input validation
- Improve error handling
- Update tests"

# Push to same branch
git push
```

The PR automatically updates with new commits!

#### 3. Mark Comments as Resolved

- After fixing, click "Resolve conversation" on GitHub
- Add a comment explaining the fix

#### 4. Request Re-review

- After addressing all comments
- Click "Re-request review" button
- Or tag reviewer: "@username ready for re-review"

### Handling Conflicts

If your PR has conflicts:

```bash
# Update your branch with latest develop
git checkout feature/your-feature
git fetch origin
git merge origin/develop

# Fix conflicts in files
# ... resolve conflicts ...

# After resolving
git add .
git commit -m "merge: Resolve conflicts with develop"
git push
```

---

## Merging Your PR

### When to Merge

Your PR is ready to merge when:
- ✅ All required reviews approved
- ✅ All automated checks pass
- ✅ No unresolved comments
- ✅ No merge conflicts
- ✅ Up to date with base branch

### Merge Methods

#### 1. Squash and Merge (Recommended)
- Combines all commits into one
- Cleaner git history
- Good for feature branches

```
Creates one commit:
feat: Add course enrollment feature (#123)
```

#### 2. Merge Commit
- Preserves all individual commits
- Full history visible
- Good for complex features

#### 3. Rebase and Merge
- Linear history
- No merge commit
- Requires clean commit history

**CreatorLMS Standard:** Use **Squash and Merge** for most PRs

### After Merge

```bash
# Switch back to develop
git checkout develop

# Pull latest (includes your merged code)
git pull origin develop

# Delete your feature branch locally
git branch -d feature/your-feature

# Delete remote branch (usually done automatically by GitHub)
git push origin --delete feature/your-feature
```

---

## Common Issues

### Issue 1: PR Has Conflicts

**Solution:**
```bash
git checkout feature/your-feature
git fetch origin
git merge origin/develop
# Fix conflicts
git add .
git commit -m "merge: Resolve conflicts"
git push
```

### Issue 2: Failed CI Checks

**Solution:**
1. Click on failed check details
2. Read error messages
3. Fix issues locally
4. Commit and push fixes

```bash
# Run tests locally first
npm test
composer test

# Fix issues, then
git add .
git commit -m "fix: Resolve test failures"
git push
```

### Issue 3: Accidentally Pushed to Wrong Branch

**Solution:**
```bash
# Create PR from correct branch
git checkout develop
git pull
git checkout -b correct-branch
git cherry-pick <commit-hash>
git push -u origin correct-branch

# Create new PR from correct branch
# Close old PR
```

### Issue 4: Need to Update PR Title/Description

**Solution:**
- Just edit on GitHub web interface
- Click "Edit" next to PR title
- Update and save

### Issue 5: Forgot to Add Tests

**Solution:**
```bash
# Add tests
# ... create test files ...

git add tests/
git commit -m "test: Add unit tests for enrollment"
git push
```

PR automatically updates!

---

## PR Size Guidelines

### Ideal PR Sizes

- **Tiny** (1-10 lines): ✅ Perfect for docs or config
- **Small** (11-50 lines): ✅ Ideal, quick to review
- **Medium** (51-200 lines): ✅ Good size
- **Large** (201-400 lines): ⚠️ Consider splitting
- **Huge** (400+ lines): ❌ Must split

### How to Split Large PRs

If your PR is too large:

1. **Split by Feature**
   - PR 1: Core functionality
   - PR 2: UI components
   - PR 3: Tests and documentation

2. **Split by File Type**
   - PR 1: Backend changes
   - PR 2: Frontend changes
   - PR 3: Database changes

---

## Quick Reference

### Essential Commands

```bash
# Create branch
git checkout -b feature/name

# Check status
git status

# Stage changes
git add .

# Commit
git commit -m "feat: description"

# Push
git push -u origin feature/name

# Update branch
git pull origin develop

# Delete branch after merge
git branch -d feature/name
```

### PR Checklist

Before creating PR:
- [ ] Code works locally
- [ ] Tests pass
- [ ] Code follows standards
- [ ] Self-reviewed
- [ ] Documentation updated

After creating PR:
- [ ] Added description
- [ ] Added reviewers
- [ ] Linked issues
- [ ] Responded to feedback
- [ ] Resolved conflicts

---

## Resources

- [GitHub PR Documentation](https://docs.github.com/en/pull-requests)
- [Creating a PR](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/creating-a-pull-request)
- [Reviewing PRs](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/reviewing-changes-in-pull-requests)

---

> **Note**: Replace this content with the actual content from your "How to make PR.pdf" file.
> After replacing, restart Claude Desktop to load the new documentation.
