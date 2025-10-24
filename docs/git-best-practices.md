# Git Best Practices

> **IMPORTANT**: Follow these Git practices for all CreatorLMS development work.

---

## Table of Contents

1. [Git Workflow](#git-workflow)
2. [Branching Strategy](#branching-strategy)
3. [Commit Guidelines](#commit-guidelines)
4. [Pull Request Guidelines](#pull-request-guidelines)
5. [Merge Strategies](#merge-strategies)
6. [Common Commands](#common-commands)
7. [Troubleshooting](#troubleshooting)

---

## Git Workflow

### Standard Development Workflow

```bash
# 1. Start with updated main/develop
git checkout develop
git pull origin develop

# 2. Create feature branch
git checkout -b feature/new-dashboard

# 3. Make changes and commit
git add .
git commit -m "feat: Add student dashboard component"

# 4. Push to remote
git push -u origin feature/new-dashboard

# 5. Create Pull Request on GitHub

# 6. After review and approval, merge PR

# 7. Delete branch after merge
git branch -d feature/new-dashboard
git push origin --delete feature/new-dashboard
```

---

## Branching Strategy

### Branch Types

#### 1. Main Branches

**`main` or `master`**
- Production-ready code
- Only merge through PRs
- Never commit directly
- Protected branch

**`develop`**
- Integration branch
- Latest development changes
- Base for feature branches
- Staging/testing environment

#### 2. Supporting Branches

**Feature Branches**
```bash
feature/course-builder
feature/payment-integration
feature/email-notifications
```
- Branch from: `develop`
- Merge back to: `develop`
- Naming: `feature/descriptive-name`
- Delete after merge

**Bugfix Branches**
```bash
fix/enrollment-error
fix/payment-timeout
fix/email-validation
```
- Branch from: `develop`
- Merge back to: `develop`
- Naming: `fix/issue-description`
- Delete after merge

**Hotfix Branches**
```bash
hotfix/critical-security-patch
hotfix/payment-gateway-down
```
- Branch from: `main`
- Merge to: `main` AND `develop`
- Naming: `hotfix/critical-issue`
- For urgent production fixes

**Release Branches**
```bash
release/1.2.0
release/2.0.0
```
- Branch from: `develop`
- Merge to: `main` and `develop`
- Naming: `release/version`
- For preparing releases

### Branch Naming Conventions

```
Type/Short-Description

Types:
- feature/  : New features
- fix/      : Bug fixes
- hotfix/   : Critical production fixes
- refactor/ : Code refactoring
- docs/     : Documentation changes
- test/     : Adding tests
- chore/    : Maintenance tasks
```

**Good Examples:**
```
feature/course-enrollment
fix/payment-validation-bug
hotfix/security-vulnerability
refactor/database-queries
docs/api-documentation
test/enrollment-unit-tests
chore/update-dependencies
```

**Bad Examples:**
```
❌ new-feature
❌ fix-bug
❌ johns-branch
❌ temp
❌ test123
```

---

## Commit Guidelines

### Commit Message Format

```
<type>: <subject>

<body (optional)>

<footer (optional)>
```

### Commit Types

```
feat:     New feature
fix:      Bug fix
docs:     Documentation changes
style:    Code style changes (formatting, no logic change)
refactor: Code refactoring
perf:     Performance improvements
test:     Adding or updating tests
chore:    Maintenance tasks
build:    Build system changes
ci:       CI/CD changes
revert:   Revert a previous commit
```

### Examples

#### Simple Commit
```bash
git commit -m "feat: Add course enrollment functionality"
```

#### Detailed Commit
```bash
git commit -m "fix: Resolve payment gateway timeout issue

The payment gateway was timing out for large transactions.
Increased timeout from 30s to 60s and added retry logic.

Fixes #123"
```

#### Multiple Changes
```bash
git commit -m "feat: Add student dashboard

- Add dashboard layout component
- Implement course progress widget
- Add activity feed
- Include performance metrics

Closes #456"
```

### Commit Best Practices

1. **Write Clear Messages**
   ```
   ✅ "feat: Add email verification for new users"
   ❌ "update code"
   ```

2. **Use Present Tense**
   ```
   ✅ "Add feature" not "Added feature"
   ✅ "Fix bug" not "Fixed bug"
   ```

3. **Keep Commits Atomic**
   - One commit = one logical change
   - Don't mix multiple unrelated changes
   - Makes code review easier
   - Easier to revert if needed

4. **Commit Often**
   - Commit after each logical change
   - Don't wait until end of day
   - Easier to track progress
   - Easier to find bugs

### What NOT to Commit

```bash
# Never commit these:
.env
.env.local
node_modules/
vendor/
*.log
.DS_Store
wp-config.php
.idea/
.vscode/
```

Use `.gitignore` file:
```
# .gitignore
.env
.env.*
!.env.example
node_modules/
vendor/
*.log
.DS_Store
wp-config.php
composer.lock
package-lock.json
```

---

## Pull Request Guidelines

### Before Creating PR

1. **Update Your Branch**
   ```bash
   git checkout develop
   git pull origin develop
   git checkout feature/your-feature
   git merge develop  # or git rebase develop
   ```

2. **Run Tests**
   ```bash
   npm test
   composer test
   ```

3. **Check Code Quality**
   ```bash
   # PHP CodeSniffer
   phpcs --standard=WordPress path/to/files

   # ESLint
   npm run lint
   ```

4. **Self-Review**
   - Review your own changes
   - Remove debug code
   - Check for commented code
   - Verify no sensitive data

### PR Title Format

```
<type>: <description>

Examples:
feat: Add course enrollment system
fix: Resolve payment gateway timeout
docs: Update API documentation
refactor: Optimize database queries
```

### PR Description Template

```markdown
## Description
Brief description of what this PR does

## Type of Change
- [ ] New feature
- [ ] Bug fix
- [ ] Breaking change
- [ ] Documentation update

## Changes Made
- List of changes
- Another change
- More changes

## Testing
How to test this PR:
1. Step one
2. Step two
3. Expected result

## Screenshots (if applicable)
[Add screenshots or GIFs]

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-reviewed the code
- [ ] Commented complex code
- [ ] Updated documentation
- [ ] Added tests
- [ ] All tests pass
- [ ] No breaking changes (or documented)

## Related Issues
Fixes #123
Closes #456
```

### PR Size Guidelines

- **Small** (1-50 lines): ✅ Ideal, quick to review
- **Medium** (51-200 lines): ✅ Good, reasonable size
- **Large** (201-400 lines): ⚠️ Consider splitting
- **Huge** (400+ lines): ❌ Must split into smaller PRs

---

## Merge Strategies

### 1. Merge Commit (Default)
```bash
git merge feature/new-feature
```
- Preserves all commits
- Creates merge commit
- Full history visible
- Good for feature branches

### 2. Squash and Merge
```bash
git merge --squash feature/new-feature
git commit -m "feat: Add new feature"
```
- Combines all commits into one
- Cleaner history
- Loses individual commit messages
- Good for small features

### 3. Rebase and Merge
```bash
git rebase develop
git checkout develop
git merge feature/new-feature
```
- Linear history
- No merge commits
- Cleaner git log
- Rewrites history

**CreatorLMS Recommendation:**
- Use **Squash and Merge** for small features
- Use **Merge Commit** for large features
- Use **Rebase** for keeping branch updated

---

## Common Commands

### Basic Commands

```bash
# Check status
git status

# View changes
git diff

# View commit history
git log --oneline --graph --all

# Undo last commit (keep changes)
git reset --soft HEAD~1

# Undo last commit (discard changes)
git reset --hard HEAD~1

# Stash changes
git stash
git stash pop

# View stash list
git stash list

# Apply specific stash
git stash apply stash@{0}
```

### Branch Commands

```bash
# List branches
git branch -a

# Create branch
git checkout -b feature/new-feature

# Switch branch
git checkout develop

# Delete local branch
git branch -d feature/old-feature

# Delete remote branch
git push origin --delete feature/old-feature

# Rename branch
git branch -m old-name new-name
```

### Remote Commands

```bash
# Add remote
git remote add origin <url>

# View remotes
git remote -v

# Fetch updates
git fetch origin

# Pull with rebase
git pull --rebase origin develop

# Force push (use carefully!)
git push --force-with-lease origin feature/branch
```

### Advanced Commands

```bash
# Interactive rebase (last 3 commits)
git rebase -i HEAD~3

# Cherry-pick commit
git cherry-pick <commit-hash>

# Find who changed a line
git blame file.php

# Search commits
git log --grep="keyword"

# View file history
git log --follow file.php
```

---

## Troubleshooting

### Merge Conflicts

```bash
# 1. Update branch
git fetch origin
git merge origin/develop

# 2. Conflicts occur - fix manually in files

# 3. After fixing, add files
git add .

# 4. Complete merge
git merge --continue
# or if rebasing
git rebase --continue
```

### Undo Mistakes

```bash
# Undo last commit (keep changes)
git reset --soft HEAD~1

# Undo changes to file
git checkout -- file.php

# Undo all local changes
git reset --hard HEAD

# Recover deleted commits
git reflog
git cherry-pick <commit-hash>
```

### Clean Up

```bash
# Remove untracked files
git clean -fd

# Prune deleted remote branches
git fetch --prune

# Delete merged branches
git branch --merged | grep -v "\*" | xargs -n 1 git branch -d
```

---

## Git Aliases (Optional)

Add to `~/.gitconfig`:

```bash
[alias]
    st = status
    co = checkout
    br = branch
    ci = commit
    unstage = reset HEAD --
    last = log -1 HEAD
    visual = log --oneline --graph --all --decorate
    amend = commit --amend --no-edit
```

Usage:
```bash
git st          # instead of git status
git co develop  # instead of git checkout develop
git visual      # nice visual log
```

---

## Best Practices Summary

### DO ✅

- ✅ Commit early and often
- ✅ Write descriptive commit messages
- ✅ Keep commits atomic
- ✅ Pull before starting work
- ✅ Create feature branches
- ✅ Review your own code before PR
- ✅ Delete merged branches
- ✅ Use .gitignore properly

### DON'T ❌

- ❌ Commit directly to main/develop
- ❌ Commit sensitive data
- ❌ Force push to shared branches
- ❌ Create huge PRs
- ❌ Commit commented code
- ❌ Commit node_modules or vendor
- ❌ Use vague commit messages
- ❌ Mix unrelated changes in one commit

---

## Resources

- [Git Documentation](https://git-scm.com/doc)
- [GitHub Flow](https://guides.github.com/introduction/flow/)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Git Best Practices](https://www.git-tower.com/learn/git/ebook/en/command-line/appendix/best-practices)

---

> **Note**: Replace this content with the actual content from your "Git Best Practices.pdf" file.
> After replacing, restart Claude Desktop to load the new documentation.
