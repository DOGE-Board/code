<template>
  <div>
    <!-- Single Form -->
    <div v-if="user" class="argument-form-section">
      <h4>{{ argumentForm.id ? 'Your Argument' : 'Your Argument' }}</h4>
      <div v-if="!userHasArgument || argumentForm.id" class="argument-form">
        <el-select 
          v-model="argumentForm.type" 
          placeholder="Select argument type"
        >
          <el-option label="In Favor" value="favor" />
          <el-option label="Against" value="against" />
        </el-select>
        <el-input
          v-model="argumentForm.content"
          type="textarea"
          :rows="3"
          placeholder="Write your argument..."
        />
        <div class="form-actions">
          <el-button 
            v-if="argumentForm.id" 
            @click="resetForm"
          >
            Cancel
          </el-button>
          <el-button 
            type="primary" 
            @click="handleSubmit" 
            :loading="isLoading"
          >
            {{ argumentForm.id ? 'Update' : 'Add' }} Argument
          </el-button>
        </div>
      </div>
      <div v-else-if="userHasArgument" class="user-argument">
        <div class="argument-header">
          <span>Your Argument ({{ userArgument.argument_type === 'favor' ? 'In Favor' : 'Against' }}):</span>
          <div class="argument-actions">
            <el-button type="text" @click="startEdit">Edit</el-button>
            <el-button type="text" class="delete-btn" @click="deleteArgument">Delete</el-button>
          </div>
        </div>
        <p>{{ userArgument.content }}</p>
      </div>
    </div>

    <!-- Arguments Display -->
    <div class="arguments-display">
      <div class="proposal-section">
        <h4>Arguments in Favor</h4>
        <div class="arguments-list">
          <div v-for="arg in favorArguments" :key="arg.id" class="argument">
            <div class="argument-header">
              <span class="argument-author">{{ arg.userEmail }}</span>
              <span class="argument-date">{{ new Date(arg.created_at).toLocaleDateString() }}</span>
            </div>
            <p class="argument-content">{{ arg.content }}</p>
          </div>
          <div v-if="!favorArguments.length" class="no-arguments">
            No arguments in favor yet
          </div>
        </div>
      </div>

      <div class="proposal-section">
        <h4>Arguments Against</h4>
        <div class="arguments-list">
          <div v-for="arg in againstArguments" :key="arg.id" class="argument">
            <div class="argument-header">
              <span class="argument-author">{{ arg.userEmail }}</span>
              <span class="argument-date">{{ new Date(arg.created_at).toLocaleDateString() }}</span>
            </div>
            <p class="argument-content">{{ arg.content }}</p>
          </div>
          <div v-if="!againstArguments.length" class="no-arguments">
            No arguments against yet
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent } from 'vue'
import { supabase } from '../supabase'
import { ElMessage } from 'element-plus'

export default defineComponent({
  name: 'ProposalArguments',
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
      favorArguments: [],
      againstArguments: [],
      argumentForm: {
        type: 'favor',
        content: '',
        id: null
      },
      isLoading: false
    }
  },
  computed: {
    userArgument() {
      return [...this.favorArguments, ...this.againstArguments]
        .find(arg => arg.user_id === this.user?.id)
    },
    userHasArgument() {
      return !!this.userArgument
    }
  },
  mounted() {
    this.fetchArguments()
  },
  methods: {
    async fetchArguments() {
      const { data, error } = await supabase
        .from('proposal_arguments')
        .select(`*`)
        .eq('proposal_id', this.proposalId)
        .order('created_at', { ascending: false })
      
      if (error) {
        ElMessage.error('Error fetching arguments')
        return
      }

      const argumentsWithUserInfo = await Promise.all(
        data.map(async (arg) => {
          const { data: userData, error: userError } = await supabase
            .rpc('get_user_info_by_id', {
              user_id: arg.user_id
            })
          return {
            ...arg,
            userEmail: userError ? 'Unknown User' : userData[0].email
          }
        })
      )

      this.favorArguments = argumentsWithUserInfo.filter(arg => arg.argument_type === 'favor')
      this.againstArguments = argumentsWithUserInfo.filter(arg => arg.argument_type === 'against')
      
      // Emit the counts to parent
      this.$emit('arguments-updated', {
        favorCount: this.favorArguments.length,
        againstCount: this.againstArguments.length
      })
    },

    async handleSubmit() {
      if (!this.argumentForm.content.trim()) return

      this.isLoading = true
      try {
        if (this.argumentForm.id) {
          const { error } = await supabase
            .from('proposal_arguments')
            .update({ 
              content: this.argumentForm.content.trim(),
              argument_type: this.argumentForm.type
            })
            .eq('id', this.argumentForm.id)
            .eq('user_id', this.user.id)
            //.eq('argument_type', this.userArgument.argument_type)

          if (error) throw error
          ElMessage.success('Argument updated successfully')
        } else {
          const { error } = await supabase
            .from('proposal_arguments')
            .insert({
              proposal_id: parseInt(this.proposalId),
              user_id: this.user.id,
              argument_type: this.argumentForm.type,
              content: this.argumentForm.content.trim()
            })

          if (error) throw error
          ElMessage.success('Argument added successfully')
        }

        this.resetForm()
        await this.fetchArguments()
      } catch (error) {
        ElMessage.error(`Error ${this.argumentForm.id ? 'updating' : 'adding'} argument`)
      } finally {
        this.isLoading = false
      }
    },

    startEdit() {
      const currentArg = this.userArgument
      this.argumentForm = {
        type: currentArg.argument_type,
        content: currentArg.content,
        id: currentArg.id
      }
    },

    resetForm() {
      this.argumentForm = {
        type: 'favor',
        content: '',
        id: null
      }
    },

    async deleteArgument() {
      try {
        const { error } = await supabase
          .from('proposal_arguments')
          .delete()
          .eq('id', this.userArgument.id)
          .eq('user_id', this.user.id)

        if (error) throw error

        await this.fetchArguments()
        ElMessage.success('Argument deleted successfully')
      } catch (error) {
        ElMessage.error('Error deleting argument')
      }
    }
  }
})
</script>

<style scoped>
.argument-form-section {
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 4px;
  margin-bottom: 2rem;
}

.argument-form-section h2 {
  margin-top: 0;
  margin-bottom: 1rem;
}

.argument-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.el-select {
  width: 100%;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.arguments-display {
  display: flex;
  gap: 2rem;
}

.proposal-section {
  flex: 1;
}

.arguments-list {
  margin-top: 1rem;
}

.argument {
  border-bottom: 1px solid #eee;
  padding: 1rem 0;
}

.argument:last-child {
  border-bottom: none;
}

.argument-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
  color: #666;
}

.argument-content {
  margin: 0;
  white-space: pre-wrap;
}

.argument-author {
  font-weight: 500;
  color: #409EFF;
}

.user-argument {
  background: #fff;
  padding: 1rem;
  border-radius: 4px;
  border: 1px solid #dcdfe6;
}

.argument-actions {
  display: flex;
  gap: 8px;
}

.delete-btn {
  color: #F56C6C;
}

.no-arguments {
  color: #909399;
  text-align: center;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 4px;
}
</style> 