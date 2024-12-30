<template>
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

<script>
import { defineComponent } from 'vue'
import { supabase } from '../supabase'
import { ElMessage } from 'element-plus'

export default defineComponent({
  name: 'Comments',
  props: {
    proposalId: {
      type: [String, Number],
      required: true
    },
    user: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      comments: [],
      newComment: '',
      commentLoading: false
    }
  },
  mounted() {
    this.fetchComments()
  },
  methods: {
    async fetchComments() {
      const { data, error } = await supabase
        .from('proposal_comments')
        .select(`*`)
        .eq('proposal_id', this.proposalId)
        .order('created_at', { ascending: false })
      
      if (error) {
        ElMessage.error('Error fetching comments')
        return
      }

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
      this.comments = commentsWithUserInfo
    },

    async handleAddComment() {
      if (!this.newComment.trim()) return
      
      this.commentLoading = true
      try {
        const { error } = await supabase
          .from('proposal_comments')
          .insert({
            proposal_id: parseInt(this.proposalId),
            user_id: this.user.id,
            content: this.newComment.trim()
          })

        if (error) throw error

        this.newComment = ''
        await this.fetchComments()
        ElMessage.success('Comment added successfully')
      } catch (error) {
        ElMessage.error('Error adding comment')
      } finally {
        this.commentLoading = false
      }
    }
  }
})
</script>

<style scoped>
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