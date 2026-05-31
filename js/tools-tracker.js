import { supabase } from './supabase-config.js';
import { showToast } from './auth.js';

// Log tool usage to Supabase
export async function logToolUsage(toolName, category, slug) {
  try {
    // 1. Check if user is logged in
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      // If not logged in, show toast notification (disappears after 3 seconds)
      showToast("🔒 Login to save your tool history", "error");
      return;
    }

    // 2. If logged in, insert into tool_usage
    const { error: insertError } = await supabase
      .from('tool_usage')
      .insert([
        {
          user_id: user.id,
          tool_name: toolName,
          tool_category: category,
          tool_slug: slug,
          used_at: new Date().toISOString()
        }
      ]);

    if (insertError) throw insertError;

    // 3. Also increment counter in profiles
    // Fetch current tools_used_count first
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('tools_used_count')
      .eq('id', user.id)
      .maybeSingle();

    if (profileError) throw profileError;

    const currentCount = (profile?.tools_used_count || 0) + 1;

    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        tools_used_count: currentCount,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id);

    if (updateError) throw updateError;

    showToast("Saved to history ✅");

  } catch (error) {
    console.error("Error logging tool usage:", error);
  }
}

// Get user dashboard statistics
export async function getUserStats() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    // 1. Total tools count from tool_usage
    const { data: usages, error: usagesError } = await supabase
      .from('tool_usage')
      .select('tool_name, tool_slug, used_at')
      .eq('user_id', user.id);

    if (usagesError) throw usagesError;

    const totalUsed = usages.length;

    // 2. Member since from profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('created_at, username, tools_used_count')
      .eq('id', user.id)
      .maybeSingle();

    if (profileError) throw profileError;

    const memberSince = profile?.created_at 
      ? new Date(profile.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) 
      : 'N/A';

    const username = profile?.username || user.email.split('@')[0];

    // 3. Most used tool calculations
    let mostUsedTool = 'None';
    let lastActive = 'Never';

    if (totalUsed > 0) {
      const counts = {};
      let maxCount = 0;
      let topTool = '';
      
      usages.forEach(u => {
        counts[u.tool_name] = (counts[u.tool_name] || 0) + 1;
        if (counts[u.tool_name] > maxCount) {
          maxCount = counts[u.tool_name];
          topTool = u.tool_name;
        }
      });
      
      mostUsedTool = topTool || 'None';

      // 4. Last active timestamp
      const timestamps = usages.map(u => new Date(u.used_at).getTime());
      const maxTimestamp = Math.max(...timestamps);
      lastActive = formatTimeAgo(maxTimestamp);
    }

    return {
      totalUsed,
      memberSince,
      mostUsedTool,
      lastActive,
      username,
      toolsUsedCount: profile?.tools_used_count || 0,
      usages
    };

  } catch (error) {
    console.error("Error retrieving user stats:", error);
    return null;
  }
}

// Format time ago helper
function formatTimeAgo(timestamp) {
  const diff = Date.now() - timestamp;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) {
    const timeStr = new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return `Today at ${timeStr}`;
  }
  const days = Math.floor(hours / 24);
  if (days === 1) return 'Yesterday';
  return `${days} days ago`;
}

// Get recent history rows
export async function getRecentHistory(limit = 6) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('tool_usage')
      .select('*')
      .eq('user_id', user.id)
      .order('used_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error getting recent history:", error);
    return [];
  }
}

// Get full history
export async function getFullHistory() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('tool_usage')
      .select('*')
      .eq('user_id', user.id)
      .order('used_at', { ascending: false });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error getting full history:", error);
    return [];
  }
}

// Export usage history as CSV
export async function exportCSV() {
  try {
    const data = await getFullHistory();
    if (data.length === 0) {
      showToast("No history found to export!", "error");
      return;
    }

    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "ID,Tool Name,Category,Slug,Used At\n";

    data.forEach(row => {
      const sanitizedName = row.tool_name.replace(/"/g, '""');
      const sanitizedCategory = row.tool_category.replace(/"/g, '""');
      csvContent += `"${row.id}","${sanitizedName}","${sanitizedCategory}","${row.tool_slug}","${row.used_at}"\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `devtoolkit_history_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast("History exported as CSV! 📊");
  } catch (error) {
    console.error("CSV Export error:", error);
    showToast("Export failed", "error");
  }
}
