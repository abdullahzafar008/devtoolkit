import { supabase } from './supabase-config.js';

// Map database and auth errors to user-friendly messages
export function getErrorMessage(error) {
  if (!error) return '';
  const msg = error.message || '';
  const status = error.status;

  if (msg.includes('Invalid login credentials') || msg.includes('invalid_credentials')) {
    return 'Incorrect password';
  }
  if (msg.includes('Email not found') || msg.includes('User not found')) {
    return 'No account with this email';
  }
  if (msg.includes('Email already registered') || msg.includes('User already exists') || msg.includes('already_registered') || msg.includes('already exists')) {
    return 'Email already registered';
  }
  if (msg.includes('Username already taken') || msg.includes('profiles_username_key') || msg.includes('duplicate key value violates unique constraint')) {
    return 'Username already taken';
  }
  if (msg.includes('Password should be at least 8 characters') || msg.includes('weak_password') || msg.includes('Password is too short') || msg.includes('should be at least 8 characters')) {
    return 'Min 8 characters required';
  }
  if (msg.includes('Failed to fetch') || msg.includes('network') || msg.includes('TypeError') || msg.includes('NetworkError')) {
    return 'Connection error, try again';
  }
  return msg;
}

// Check if username is alphanumeric only
export function isValidUsername(username) {
  return /^[a-zA-Z0-9]+$/.test(username);
}

// Toast notification helper (to be used across pages)
export function showToast(message, type = 'success') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.style.cssText = `
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 12px;
      pointer-events: none;
    `;
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.style.cssText = `
    background: rgba(5, 5, 16, 0.95);
    border: 1px solid ${type === 'success' ? 'rgba(0, 204, 255, 0.5)' : 'rgba(255, 50, 50, 0.5)'};
    color: #fff;
    padding: 14px 24px;
    border-radius: 8px;
    font-family: 'Inter', sans-serif;
    font-size: 14px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(10px);
    display: flex;
    align-items: center;
    gap: 10px;
    transform: translateY(20px);
    opacity: 0;
    transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    pointer-events: auto;
  `;
  
  const icon = document.createElement('span');
  icon.innerHTML = type === 'success' ? '✅' : '❌';
  toast.appendChild(icon);

  const text = document.createElement('span');
  text.textContent = message;
  toast.appendChild(text);

  container.appendChild(toast);

  // Trigger animation
  setTimeout(() => {
    toast.style.transform = 'translateY(0)';
    toast.style.opacity = '1';
  }, 10);

  // Remove toast
  setTimeout(() => {
    toast.style.transform = 'translateY(20px)';
    toast.style.opacity = '0';
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 4000);
}

// Sign Up
export async function signUp(email, password, username) {
  try {
    if (!isValidUsername(username)) {
      throw new Error('Username must be alphanumeric only');
    }
    if (password.length < 8) {
      throw new Error('Password should be at least 8 characters');
    }

    // 1. Check if username is already taken in profiles table
    const { data: existingProfile, error: checkError } = await supabase
      .from('profiles')
      .select('username')
      .eq('username', username)
      .maybeSingle();

    if (checkError) throw checkError;
    if (existingProfile) {
      throw new Error('Username already taken');
    }

    // 2. Sign up user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password
    });

    if (authError) throw authError;
    if (!authData.user) {
      throw new Error('Sign up failed. Please check credentials.');
    }

    // 3. Insert profiles row
    const { error: profileError } = await supabase
      .from('profiles')
      .insert([
        {
          id: authData.user.id,
          username: username,
          display_name: username,
          avatar_color: '#0066FF',
          tools_used_count: 0
        }
      ]);

    if (profileError) {
      // Clean up user if profile fails (if supported/possible)
      throw profileError;
    }

    showToast('Account created successfully! ✅');
    setTimeout(() => {
      window.location.href = '/dashboard.html';
    }, 1500);

  } catch (error) {
    showToast(getErrorMessage(error), 'error');
    throw error;
  }
}

// Sign In
export async function signIn(email, password) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;

    showToast('Logged in successfully! 👋');
    setTimeout(() => {
      window.location.href = '/dashboard.html';
    }, 1500);

  } catch (error) {
    showToast(getErrorMessage(error), 'error');
    throw error;
  }
}

// Sign Out
export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    
    showToast('Signed out successfully! 👋');
    setTimeout(() => {
      window.location.href = '/index.html';
    }, 1000);
  } catch (error) {
    showToast(getErrorMessage(error), 'error');
  }
}

// Reset Password
export async function resetPassword(email) {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + '/profile.html'
    });
    if (error) throw error;
    showToast('Password reset email sent! ✉️');
  } catch (error) {
    showToast(getErrorMessage(error), 'error');
    throw error;
  }
}

// Update Profile
export async function updateProfile(profileData) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // If username is changing, validate it
    if (profileData.username && !isValidUsername(profileData.username)) {
      throw new Error('Username must be alphanumeric only');
    }

    const { error } = await supabase
      .from('profiles')
      .update(profileData)
      .eq('id', user.id);

    if (error) throw error;
    showToast('Profile updated! ✅');
  } catch (error) {
    showToast(getErrorMessage(error), 'error');
    throw error;
  }
}

// Change Password
export async function changePassword(newPassword) {
  try {
    if (newPassword.length < 8) {
      throw new Error('Password should be at least 8 characters');
    }

    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (error) throw error;
    showToast('Password updated successfully! ✅');
  } catch (error) {
    showToast(getErrorMessage(error), 'error');
    throw error;
  }
}

// Delete Account
export async function deleteAccount() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // 1. Delete tool_usage rows
    const { error: usageError } = await supabase
      .from('tool_usage')
      .delete()
      .eq('user_id', user.id);
    if (usageError) throw usageError;

    // 2. Delete profiles row
    const { error: profileError } = await supabase
      .from('profiles')
      .delete()
      .eq('id', user.id);
    if (profileError) throw profileError;

    // 3. Delete auth user (usually triggers RPC self-delete if configured)
    const { error: rpcError } = await supabase.rpc('delete_user_self');
    if (rpcError) {
      console.warn("RPC delete_user_self failed, proceeding to signOut", rpcError);
    }

    // Call sign out to clear local session
    await supabase.auth.signOut();
    
    showToast('Account permanently deleted. Bye! 👋');
    setTimeout(() => {
      window.location.href = '/index.html';
    }, 1500);

  } catch (error) {
    showToast(getErrorMessage(error), 'error');
    throw error;
  }
}

// Check Auth State
export async function checkAuth(requireAuth) {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    const loggedIn = !!session;

    if (requireAuth && !loggedIn) {
      window.location.href = '/login.html';
      return null;
    }
    if (!requireAuth && loggedIn) {
      window.location.href = '/dashboard.html';
      return null;
    }
    
    return session ? session.user : null;
  } catch (error) {
    console.error('Auth check error:', error);
    if (requireAuth) {
      window.location.href = '/login.html';
    }
    return null;
  }
}
