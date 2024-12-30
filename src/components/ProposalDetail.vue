<template>
  <div class="proposal-detail-container">
    <Header />
    <div class="proposal-detail-content">
      <template v-if="proposal">
        <h1>{{ proposal.name }}</h1>
        
        <div class="proposal-stats">
          <el-button 
            :type="getUserVote(proposal.id) === 'up' ? 'success' : 'default'"
            size="large" 
            @click="handleVote(proposal.id, 'up')"
            :disabled="!user"
          >
            <i class="fas fa-arrow-up"></i>
            <span>{{ proposal.upVotes }} Up Votes</span>
          </el-button>
          <el-button 
            :type="getUserVote(proposal.id) === 'down' ? 'danger' : 'default'"
            size="large" 
            @click="handleVote(proposal.id, 'down')"
            :disabled="!user"
          >
            <i class="fas fa-arrow-down"></i>
            <span>{{ proposal.downVotes }} Down Votes</span>
          </el-button>
        </div>

        <div class="proposal-section">
          <h2>Description</h2>
          <p>{{ proposal.description }}</p>
        </div>

        <div class="proposal-section">
          <h2>Arguments in Favor</h2>
          <p>{{ proposal.favorArguments }}</p>
          
        </div>

        <div class="proposal-section">
          <h2>Arguments Against</h2>
          <p>{{ proposal.againstArguments }}</p>
          
        </div>

        <div class="proposal-section">
          <h2>Comments</h2>
          
          <div class="comments-list">
            <div v-for="comment in comments" :key="comment.id" class="comment">
              <div class="comment-header">
                <span class="comment-author">{{ comment.userEmail }}</span>
                <span class="comment-date">{{ new Date(comment.created_at).toLocaleDateString() }}</span>
              </div>
              <p class="comment-content">{{ comment.content }}</p>
            </div>
          </div>

          <div v-if="user" class="comment-form">
            <el-input
              v-model="newComment"
              type="textarea"
              :rows="3"
              placeholder="Write your comment..."
            />
            <el-button type="primary" @click="handleAddComment" :loading="commentLoading">
              Add Comment
            </el-button>
          </div>
          <div v-else class="login-prompt">
            Please login to comment
          </div>
        </div>
      </template>
      <div v-else class="not-found">
        Proposal not found
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import Header from './Header.vue'
import { proposals, fetchProposals } from '../data/proposals'
import { supabase } from '../supabase'
import { ElMessage } from 'element-plus'

const route = useRoute()
const user = ref(null)
const userVotes = ref({})
const comments = ref([])
const newComment = ref('')
const commentLoading = ref(false)

const proposal = computed(() => 
  proposals.value.find(p => p.id === parseInt(route.params.id))
)

onMounted(async () => {
  const { data: { user: currentUser } } = await supabase.auth.getUser()
  user.value = currentUser
  
  if (currentUser) {
    await fetchUserVotes()
  }
  
  await Promise.all([
    fetchProposals(),
    fetchComments()
  ])
})

const fetchUserVotes = async () => {
  const { data: votes } = await supabase
    .from('proposal_votes')
    .select('proposal_id, vote_type')
    .eq('user_id', user.value.id)

  if (votes) {
    votes.forEach(vote => {
      userVotes.value[vote.proposal_id] = vote.vote_type
    })
  }
}

const getUserVote = (proposalId) => {
  return userVotes.value[proposalId]
}

const handleVote = async (proposalId, voteType) => {
  if (!user.value) return
  
  const currentVote = getUserVote(proposalId)
  
  try {
    if (currentVote === voteType) {
      // Remove vote
      await supabase
        .from('proposal_votes')
        .delete()
        .eq('proposal_id', proposalId)
        .eq('user_id', user.value.id)
      
      delete userVotes.value[proposalId]
    } else {
      // Upsert vote
      await supabase
        .from('proposal_votes')
        .upsert({
          proposal_id: proposalId,
          user_id: user.value.id,
          vote_type: voteType
        })
      
      userVotes.value[proposalId] = voteType
    }
    
    await fetchProposals()
  } catch (error) {
    ElMessage.error('Error while voting')
  }
}

const fetchComments = async () => {
  const { data, error } = await supabase
    .from('proposal_comments')
    .select(`*`)
    .eq('proposal_id', route.params.id)
    .order('created_at', { ascending: false })


    
  if (error) {
    ElMessage.error('Error fetching comments')
    return
  }

  // Fetch user info for each comment
  const commentsWithUserInfo = await Promise.all(
    data.map(async (comment) => {
      const { data: userData, error: userError } = await supabase
        .rpc('get_user_info_by_id', {
          user_id: comment.user_id
        })
      return {
        ...comment,
       userEmail: userError ? 'Unknown User' : userData[0].email
      }
    })
  )
  comments.value = commentsWithUserInfo
}

const handleAddComment = async () => {
  if (!newComment.value.trim()) return
  
  commentLoading.value = true
  try {
    const { error } = await supabase
      .from('proposal_comments')
      .insert({
        proposal_id: parseInt(route.params.id),
        user_id: user.value.id,
        content: newComment.value.trim()
      })

    if (error) throw error

    newComment.value = ''
    await fetchComments()
    ElMessage.success('Comment added successfully')
  } catch (error) {
    ElMessage.error('Error adding comment')
  } finally {
    commentLoading.value = false
  }
}
</script>

<style scoped>
.proposal-detail-container {
  min-height: 100vh;
  background-color: #f5f7fa;
}

.proposal-detail-content {
  padding: 2rem;
  max-width: 800px;
  margin: 0 auto;
}

h1 {
  margin-bottom: 1.5rem;
  color: #333;
}

h2 {
  color: #666;
  margin-bottom: 1rem;
}

.proposal-stats {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
}

.proposal-stats .el-button {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 1rem;
}

.proposal-stats i {
  font-size: 1.2rem;
}

.proposal-section {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  margin-bottom: 1.5rem;
}

.argument-list {
  margin: 0;
  padding-left: 20px;
}

.argument-list li {
  margin-bottom: 0.5rem;
}

.not-found {
  text-align: center;
  font-size: 1.2rem;
  color: #666;
  margin-top: 2rem;
}

.comments-list {
  margin-bottom: 1.5rem;
}

.comment {
  border-bottom: 1px solid #eee;
  padding: 1rem 0;
}

.comment:last-child {
  border-bottom: none;
}

.comment-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
  color: #666;
}

.comment-content {
  margin: 0;
  white-space: pre-wrap;
}

.comment-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.login-prompt {
  text-align: center;
  color: #666;
  padding: 1rem;
  background: #f9f9f9;
  border-radius: 4px;
}

.comment-author {
  font-weight: 500;
  color: #409EFF;
}
</style> 