import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, CheckCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabaseClient';
// Using a type import for TypeScript support
import type { CreateTypes } from 'canvas-confetti';
// Will dynamically import at runtime
declare const confetti: CreateTypes;

// Add toast utility function since it's missing
const toast = ({ title, description, status }: { title: string; description: string; status: string }) => {
  // Simple alert-based toast implementation
  alert(`${title}: ${description}`);
};

// Types
interface Goal {
  id: string;
  user_id: string;
  title: string;
  category: 'Content' | 'Growth' | 'Engagement' | 'Monetization';
  target_value: number;
  deadline: string | null;
  progress: number;
  status: 'pending' | 'completed';
  created_at: string;
  completed_at: string | null;
}

interface Badge {
  badge_id: string;
  user_id: string;
  badge_name: string;
  awarded_at: string;
}

function ChannelGoals(): JSX.Element {
  const { user } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [xp, setXp] = useState(0);
  const [level, setLevel] = useState(0);
  const [newGoal, setNewGoal] = useState<{
    title: string;
    category: Goal['category'];
    target_value: number;
    deadline: string;
  }>({
    title: '',
    category: 'Content',
    target_value: 0,
    deadline: '',
  });
  const [useLocalStorage, setUseLocalStorage] = useState(false);

  // Fetch user's goals and badges
  useEffect(() => {
    if (user) {
      fetchGoals();
      fetchBadges();
    }
  }, [user]);

  // Calculate XP and Level
  useEffect(() => {
    const completedGoals = goals.filter(goal => goal.status === 'completed').length;
    const calculatedXp = completedGoals * 50;
    setXp(calculatedXp);
    setLevel(Math.floor(calculatedXp / 100));
  }, [goals]);

  const fetchGoals = async () => {
    try {
      // First try to get goals from Supabase
      const { data, error } = await supabase
        .from('user_goals')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) {
        // If the error is related to the table not existing, use localStorage instead
        if (error.code === '42P01') { // PostgreSQL error code for "relation does not exist"
          setUseLocalStorage(true);
          const storedGoals = localStorage.getItem(`smarttube_goals_${user?.id}`);
          if (storedGoals) {
            setGoals(JSON.parse(storedGoals));
          }
        } else {
          throw error;
        }
      } else {
        setGoals(data || []);
      }
    } catch (error) {
      console.error('Error fetching goals:', error);
      // Fallback to localStorage if any error occurs
      setUseLocalStorage(true);
      const storedGoals = localStorage.getItem(`smarttube_goals_${user?.id}`);
      if (storedGoals) {
        setGoals(JSON.parse(storedGoals));
      }
    }
  };

  const fetchBadges = async () => {
    try {
      if (user) {
        // Try to fetch badges from Supabase
        const { data, error } = await supabase
          .from('user_badges')
          .select('*')
          .eq('user_id', user.id);
          
        if (error) {
          console.error('Error fetching badges:', error);
          // If there's an error, set empty badges array
          setBadges([]);
        } else {
          setBadges(data || []);
        }
      }
    } catch (error) {
      console.error('Error fetching badges:', error);
      setBadges([]);
    }
  };

  // Save goals to localStorage when they change and we're using localStorage
  useEffect(() => {
    if (useLocalStorage && user) {
      localStorage.setItem(`smarttube_goals_${user.id}`, JSON.stringify(goals));
    }
  }, [goals, useLocalStorage, user]);

  const handleAddGoal = async () => {
    try {
      if (!newGoal.title.trim()) {
        alert('Please enter a goal title');
        return;
      }
      
      if (newGoal.target_value <= 0) {
        alert('Please enter a valid target value greater than 0');
        return;
      }

      if (!user?.id) {
        alert('You must be logged in to add goals');
        return;
      }

      // Create a new goal object with all required fields
      const newGoalData = {
        user_id: user.id,
        title: newGoal.title.trim(),
        category: newGoal.category,
        target_value: parseInt(newGoal.target_value.toString()),
        deadline: newGoal.deadline || null,
        progress: 0,
        status: 'pending',
        created_at: new Date().toISOString(),
        completed_at: null
      };

      if (useLocalStorage) {
        // Add goal to local state with a generated ID
        const newGoalWithId: Goal = {
          ...newGoalData,
          id: Date.now().toString(), // Use timestamp as ID
          status: 'pending' as const
        };
        setGoals(prev => [newGoalWithId, ...prev]);
        
        toast({
          title: 'Goal added',
          description: 'Your new goal has been added successfully',
          status: 'success',
        });
      } else {
        // Try to insert the new goal
        const { data, error } = await supabase
          .from('user_goals')
          .insert(newGoalData)
          .select()
          .single();

        if (error) {
          console.error('Supabase error:', error);
          if (error.code === '42P01') {
            alert('Goals table not found. Please contact support.');
          } else if (error.code === '23505') {
            alert('A goal with this title already exists.');
          } else {
            alert(`Error adding goal: ${error.message}`);
          }
          return;
        }

        if (data) {
          // Add the new goal to the state
          setGoals(prevGoals => [...prevGoals, data]);
          
          // Reset form and close modal
          setNewGoal({
            title: '',
            category: 'Content',
            target_value: 0,
            deadline: ''
          });
          setIsModalOpen(false);
          
          // Show success message
          alert('Goal added successfully!');
        }
      }
    } catch (error) {
      console.error('Error adding goal:', error);
      alert('Failed to add goal. Please try again.');
    }
  };

  const updateGoalProgress = async (goalId: string, progress: number) => {
    try {
      if (useLocalStorage) {
        // Update goal in local state
        setGoals(prev => 
          prev.map(goal => 
            goal.id === goalId 
              ? { ...goal, progress } 
              : goal
          )
        );
      } else {
        // Try to update goal in Supabase
        const { error } = await supabase
          .from('user_goals')
          .update({ progress })
          .eq('id', goalId);

        if (error) throw error;

        // Update local state
        setGoals(prev => 
          prev.map(goal => 
            goal.id === goalId 
              ? { ...goal, progress } 
              : goal
          )
        );
      }
    } catch (error) {
      console.error('Error updating goal progress:', error);
      
      // If the error is related to the table not existing, switch to localStorage
      if (error && typeof error === 'object' && 'code' in error && error.code === '42P01') {
        setUseLocalStorage(true);
        
        // Update goal in local state
        setGoals(prev => 
          prev.map(goal => 
            goal.id === goalId 
              ? { ...goal, progress } 
              : goal
          )
        );
      } else {
        alert('Failed to update goal progress');
      }
    }
  };

  const completeGoal = async (goalId: string) => {
    try {
      if (useLocalStorage) {
        // Update goal status in local state
        setGoals(prev => 
          prev.map(goal => 
            goal.id === goalId 
              ? { ...goal, status: 'completed' } 
              : goal
          )
        );
        
        alert('Goal completed!');
      } else {
        // Try to update goal status in Supabase
        const { error } = await supabase
          .from('user_goals')
          .update({ 
            status: 'completed',
            completed_at: new Date().toISOString(),
            progress: 100
          })
          .eq('id', goalId);

        if (error) throw error;

        // Update local state
        setGoals(prev => 
          prev.map(goal =>
            goal.id === goalId
              ? { ...goal, status: 'completed', completed_at: new Date().toISOString(), progress: 100 }
              : goal
          )
        );
        
        // Trigger confetti animation
        import('canvas-confetti').then((confettiModule) => {
          const confetti = confettiModule.default;
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
          });
        });
      }
    } catch (error) {
      console.error('Error completing goal:', error);
      
      // If the error is related to the table not existing, switch to localStorage
      if (error && typeof error === 'object' && 'code' in error && error.code === '42P01') {
        setUseLocalStorage(true);
        
        // Update goal status in local state
        setGoals(prev => 
          prev.map(goal => 
            goal.id === goalId 
              ? { ...goal, status: 'completed' } 
              : goal
          )
        );
        
        alert('Goal completed!');
      } else {
        alert('Failed to complete goal');
      }
    }
  };

  const deleteGoal = async (goalId: string) => {
    try {
      if (useLocalStorage) {
        // Remove goal from local state
        setGoals(prev => prev.filter(goal => goal.id !== goalId));
        
        alert('Goal deleted!');
      } else {
        // Try to delete goal from Supabase
        const { error } = await supabase
          .from('user_goals')
          .delete()
          .eq('id', goalId);

        if (error) throw error;

        // Remove goal from local state
        setGoals(prev => prev.filter(goal => goal.id !== goalId));
        
        alert('Goal deleted!');
      }
    } catch (error) {
      console.error('Error deleting goal:', error);
      
      // If the error is related to the table not existing, switch to localStorage
      if (error && typeof error === 'object' && 'code' in error && error.code === '42P01') {
        setUseLocalStorage(true);
        
        // Remove goal from local state
        setGoals(prev => prev.filter(goal => goal.id !== goalId));
        
        alert('Goal deleted!');
      } else {
        alert('Failed to delete goal');
      }
    }
  };

  return (
    <div className="p-6 space-y-8">
      {/* Welcome Section */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-[#2762EB] to-[#9333EA]">
        <h1 className="text-3xl font-bold text-white mb-2">Channel Goals</h1>
        <p className="text-white/90">Track Your YouTube Journey</p>
      </div>

      {/* User Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-xl bg-white/5 border border-white/10">
          <h3 className="text-lg font-semibold mb-2">XP Progress</h3>
          <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#2762EB] to-[#9333EA]"
              style={{ width: `${(xp % 100)}%` }}
            />
          </div>
          <p className="mt-2 text-sm text-gray-400">Level {level}</p>
        </div>
        <div className="p-6 rounded-xl bg-white/5 border border-white/10">
          <h3 className="text-lg font-semibold mb-2">Goals Completed</h3>
          <p className="text-2xl font-bold text-[#2762EB]">
            {goals.filter(goal => goal.status === 'completed').length}
          </p>
        </div>
        <div className="p-6 rounded-xl bg-white/5 border border-white/10">
          <h3 className="text-lg font-semibold mb-2">Badges Earned</h3>
          <div className="flex flex-wrap gap-2">
            {badges.map(badge => (
              <span
                key={badge.badge_id}
                className="inline-block px-3 py-1 rounded-full text-sm bg-white/10 text-purple-400 font-medium"
              >
                {badge.badge_name}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Add Goal Button */}
      <div className="flex justify-end">
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 rounded-lg bg-[#2762EB] text-white flex items-center space-x-2 hover:bg-[#2762EB]/90 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Add New Goal</span>
        </button>
      </div>

      {/* Goals List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
        {goals.map((goal) => (
          <motion.div
            key={goal.id}
            className="bg-[#0B1120] p-6 rounded-xl border border-white/10 shadow-lg hover:border-[#2762EB]/30 transition-colors"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h3 className="text-lg font-semibold mb-2 text-white">{goal.title}</h3>
            <p className="text-gray-400 mb-4">{goal.category}</p>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-400">Target: {goal.target_value}</span>
              <span className="text-sm text-gray-400">Progress: {goal.progress}%</span>
            </div>
            <div className="flex justify-end space-x-2 mt-4">
              {goal.status !== 'completed' && (
                <button
                  onClick={() => completeGoal(goal.id)}
                  className="p-2 rounded-lg bg-green-500/10 text-green-500 hover:bg-green-500/20 transition-colors"
                >
                  <CheckCircle className="w-5 h-5" />
                </button>
              )}
              <button
                onClick={() => deleteGoal(goal.id)}
                className="p-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Add Goal Button */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-6 right-6 p-4 rounded-full bg-gradient-to-r from-[#2762EB] to-[#9333EA] text-white shadow-lg hover:scale-105 transition-transform"
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* Add Goal Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center z-40">
            <motion.div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              key="modal-backdrop"
            />
            <motion.div 
              className="relative w-full max-w-md mx-auto bg-[#0B1120] p-6 rounded-xl shadow-xl border border-white/10 z-50"
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: 'spring', duration: 0.5 }}
              key="modal-content"
            >
              <h2 className="text-xl font-semibold mb-4">Add New Goal</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Goal Title</label>
                  <input
                    type="text"
                    value={newGoal.title}
                    onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 focus:outline-none focus:border-[#2762EB] text-white"
                    placeholder="Enter goal title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Category</label>
                  <select
                    value={newGoal.category}
                    onChange={(e) => setNewGoal({ ...newGoal, category: e.target.value as Goal['category'] })}
                    className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 focus:outline-none focus:border-[#2762EB] text-white"
                    style={{ backgroundColor: '#0B1120' }}
                  >
                    <option value="Content" style={{ backgroundColor: '#0B1120' }}>Content</option>
                    <option value="Growth" style={{ backgroundColor: '#0B1120' }}>Growth</option>
                    <option value="Engagement" style={{ backgroundColor: '#0B1120' }}>Engagement</option>
                    <option value="Monetization" style={{ backgroundColor: '#0B1120' }}>Monetization</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Target Value</label>
                  <input
                    type="number"
                    value={newGoal.target_value}
                    onChange={(e) => setNewGoal({ ...newGoal, target_value: parseInt(e.target.value) || 0 })}
                    min="0"
                    className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 focus:outline-none focus:border-[#2762EB] text-white"
                    placeholder="Enter target value"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Deadline (Optional)</label>
                  <input
                    type="date"
                    value={newGoal.deadline}
                    onChange={(e) => setNewGoal({ ...newGoal, deadline: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 focus:outline-none focus:border-[#2762EB] text-white"
                  />
                </div>
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleAddGoal}
                    className="px-4 py-2 rounded-lg bg-[#2762EB] hover:bg-[#2762EB]/90 transition-colors text-white font-medium"
                  >
                    Add Goal
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default ChannelGoals;
