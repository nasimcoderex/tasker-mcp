#!/usr/bin/env node

// Debug GitHub API access issues
import { Octokit } from "octokit";

console.log('🔍 Debugging GitHub API Access...\n');

// Check if token is set
if (!process.env.GITHUB_TOKEN) {
  console.error('❌ GITHUB_TOKEN environment variable is not set!');
  console.error('📝 Please set your token: export GITHUB_TOKEN="your_token_here"');
  process.exit(1);
}

console.log('✅ GITHUB_TOKEN is set');
console.log(`🔑 Token length: ${process.env.GITHUB_TOKEN.length} characters`);
console.log(`🔑 Token prefix: ${process.env.GITHUB_TOKEN.substring(0, 8)}...`);

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

async function testGitHubAccess() {
  try {
    // Test 1: Check authenticated user
    console.log('\n📋 Test 1: Checking authenticated user...');
    const { data: user } = await octokit.rest.users.getAuthenticated();
    console.log(`✅ Authenticated as: ${user.login}`);
    console.log(`👤 User type: ${user.type}`);
    console.log(`🔗 Profile: ${user.html_url}`);

    // Test 2: Check CODEREXLTD organization access
    console.log('\n📋 Test 2: Checking CODEREXLTD organization access...');
    try {
      const { data: org } = await octokit.rest.orgs.get({ org: 'CODEREXLTD' });
      console.log(`✅ Organization access: ${org.name}`);
      console.log(`🏢 Description: ${org.description || 'No description'}`);
    } catch (orgError) {
      console.error('❌ Organization access failed:', orgError.message);
      if (orgError.status === 404) {
        console.error('💡 This could mean:');
        console.error('   • Organization name is incorrect');
        console.error('   • You don\'t have access to this organization');
        console.error('   • Organization is private and token lacks permissions');
      }
    }

    // Test 3: Check creatorlms repository access
    console.log('\n📋 Test 3: Checking creatorlms repository access...');
    try {
      const { data: repo } = await octokit.rest.repos.get({ 
        owner: 'CODEREXLTD', 
        repo: 'creatorlms' 
      });
      console.log(`✅ Repository access: ${repo.full_name}`);
      console.log(`🔒 Visibility: ${repo.visibility || repo.private ? 'private' : 'public'}`);
      console.log(`🌿 Default branch: ${repo.default_branch}`);
      console.log(`🔑 Permissions: push=${repo.permissions?.push}, admin=${repo.permissions?.admin}`);
    } catch (repoError) {
      console.error('❌ Repository access failed:', repoError.message);
      console.error(`❌ Status: ${repoError.status}`);
      if (repoError.status === 404) {
        console.error('💡 This could mean:');
        console.error('   • Repository name is incorrect');
        console.error('   • Repository doesn\'t exist');
        console.error('   • You don\'t have access to this repository');
        console.error('   • Token lacks required permissions');
      }
    }

    // Test 4: Check creatorlms-pro repository access
    console.log('\n📋 Test 4: Checking creatorlms-pro repository access...');
    try {
      const { data: repo } = await octokit.rest.repos.get({ 
        owner: 'CODEREXLTD', 
        repo: 'creatorlms-pro' 
      });
      console.log(`✅ Repository access: ${repo.full_name}`);
      console.log(`🔒 Visibility: ${repo.visibility || repo.private ? 'private' : 'public'}`);
      console.log(`🌿 Default branch: ${repo.default_branch}`);
      console.log(`🔑 Permissions: push=${repo.permissions?.push}, admin=${repo.permissions?.admin}`);
    } catch (repoError) {
      console.error('❌ Repository access failed:', repoError.message);
      console.error(`❌ Status: ${repoError.status}`);
    }

    // Test 5: Try to get branches (this is what the create_branch operation needs)
    console.log('\n📋 Test 5: Checking branch access...');
    try {
      const { data: branches } = await octokit.rest.repos.listBranches({
        owner: 'CODEREXLTD',
        repo: 'creatorlms',
        per_page: 5
      });
      console.log(`✅ Can list branches. Found ${branches.length} branches:`);
      branches.forEach(branch => {
        console.log(`   • ${branch.name}${branch.protected ? ' (protected)' : ''}`);
      });
    } catch (branchError) {
      console.error('❌ Branch listing failed:', branchError.message);
      console.error(`❌ Status: ${branchError.status}`);
    }

  } catch (error) {
    console.error('❌ GitHub API test failed:', error.message);
    console.error(`❌ Status: ${error.status}`);
    
    if (error.status === 401) {
      console.error('💡 Authentication failed. Check:');
      console.error('   • Token is valid and not expired');
      console.error('   • Token has correct format (ghp_...)');
      console.error('   • Token has required scopes');
    }
  }
}

console.log('\n🚀 Starting GitHub API tests...');
testGitHubAccess().then(() => {
  console.log('\n✨ GitHub API diagnostic complete!');
}).catch(console.error);
