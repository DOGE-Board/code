<template>
  <div>
    <div class="proposal-section">
      <h2>Arguments in Favor</h2>
      <div v-if="user && !userFavorArgument && !userAgainstArgument" class="add-argument">
        <el-input
          v-model="newFavorArgument"
          type="textarea"
          :rows="3"
          placeholder="Add your argument in favor..."
        />
        <el-button type="primary" @click="handleAddArgument('favor')" :loading="favorLoading">
          Add Argument
        </el-button>
      </div>
      <div v-else-if="user && userFavorArgument" class="user-argument">
        <div class="argument-header">
          <span>Your Argument:</span>
          <div class="argument-actions">
            <el-button type="text" @click="editArgument('favor')">Edit</el-button>
            <el-button type="text" class="delete-btn" @click="deleteArgument('favor')">Delete</el-button>
          </div>
        </div>
        <p>{{ userFavorArgument.content }}</p>
      </div>
      <div v-else-if="user && userAgainstArgument" class="user-argument disabled">
        <p class="info-text">You have already provided an argument against this proposal</p>
      </div>
      <div class="arguments-list">
        <div v-for="arg in favorArguments" :key="arg.id" class="argument">
          <div class="argument-header">
            <span class="argument-author">{{ arg.userEmail }}</span>
            <span class="argument-date">{{ new Date(arg.created_at).toLocaleDateString() }}</span>
          </div>
          <p class="argument-content">{{ arg.content }}</p>
        </div>
      </div>
    </div>

    <div class="proposal-section">
      <h2>Arguments Against</h2>
      <div v-if="user && !userAgainstArgument && !userFavorArgument" class="add-argument">
        <el-input
          v-model="newAgainstArgument"
          type="textarea"
          :rows="3"
          placeholder="Add your argument against..."
        />
        <el-button type="primary" @click="handleAddArgument('against')" :loading="againstLoading">
          Add Argument
        </el-button>
      </div>
      <div v-else-if="user && userAgainstArgument" class="user-argument">
        <div class="argument-header">
          <span>Your Argument:</span>
          <el-button type="text" @click="editArgument('against')">Edit</el-button>
          <el-button type="text" class="delete-btn" @click="deleteArgument('against')">Delete</el-button>
        </div>
        <p>{{ userAgainstArgument.content }}</p>
      </div>
      <div v-else-if="user && userFavorArgument" class="user-argument disabled">
        <p class="info-text">You have already provided an argument in favor of this proposal</p>
      </div>
      <div class="arguments-list">
        <div v-for="arg in againstArguments" :key="arg.id" class="argument">
          <div class="argument-header">
            <span class="argument-author">{{ arg.userEmail }}</span>
            <span class="argument-date">{{ new Date(arg.created_at).toLocaleDateString() }}</span>
          </div>
          <p class="argument-content">{{ arg.content }}</p>
        </div>
      </div>
    </div>

    <el-dialog
      v-model="showEditDialog"
      :title="`Edit ${editingType === 'favor' ? 'Favor' : 'Against'} Argument`"
      width="50%"
    >
      <el-input
        v-model="editContent"
        type="textarea"
        :rows="3"
      />
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showEditDialog = false">Cancel</el-button>
          <el-button type="primary" @click="handleUpdateArgument" :loading="editLoading">
            Update
          </el-button>
        </span>
      </template>
    </el-dialog>
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
      newFavorArgument: '',
      newAgainstArgument: '',
      favorLoading: false,
      againstLoading: false,
      showEditDialog: false,
      editingType: null,
      editContent: '',
      editLoading: false,
      userFavorArgument: null,
      userAgainstArgument: null
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

      if (this.user) {
        const userArgument = argumentsWithUserInfo.find(arg => arg.user_id === this.user.id)
        if (userArgument) {
          if (userArgument.argument_type === 'favor') {
            this.userFavorArgument = userArgument
            this.userAgainstArgument = null
          } else {
            this.userFavorArgument = null
            this.userAgainstArgument = userArgument
          }
        } else {
          this.userFavorArgument = null
          this.userAgainstArgument = null
        }
      }
    },

    async handleAddArgument(type) {
      const content = type === 'favor' ? this.newFavorArgument.trim() : this.newAgainstArgument.trim()
      if (!content) return

      const loading = type === 'favor' ? 'favorLoading' : 'againstLoading'
      this[loading] = true

      try {
        const { error } = await supabase
          .from('proposal_arguments')
          .insert({
            proposal_id: parseInt(this.proposalId),
            user_id: this.user.id,
            argument_type: type,
            content
          })

        if (error) throw error

        type === 'favor' ? this.newFavorArgument = '' : this.newAgainstArgument = ''
        await this.fetchArguments()
        ElMessage.success('Argument added successfully')
      } catch (error) {
        ElMessage.error('Error adding argument')
      } finally {
        this[loading] = false
      }
    },

    editArgument(type) {
      this.editingType = type
      this.editContent = type === 'favor' 
        ? this.userFavorArgument.content 
        : this.userAgainstArgument.content
      this.showEditDialog = true
    },

    async handleUpdateArgument() {
      this.editLoading = true
      try {
        const argument = this.editingType === 'favor' 
          ? this.userFavorArgument 
          : this.userAgainstArgument

        const { error } = await supabase
          .from('proposal_arguments')
          .update({ 
            content: this.editContent.trim(),
          })
          .eq('id', argument.id)
          .eq('argument_type', argument.argument_type)

        if (error) throw error

        this.showEditDialog = false
        await this.fetchArguments()
        ElMessage.success('Argument updated successfully')
      } catch (error) {
        ElMessage.error('Error updating argument')
      } finally {
        this.editLoading = false
      }
    },

    async deleteArgument(type) {
      try {
        const argument = type === 'favor' 
          ? this.userFavorArgument 
          : this.userAgainstArgument

        const { error } = await supabase
          .from('proposal_arguments')
          .delete()
          .eq('id', argument.id)
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

.add-argument {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.user-argument {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 1.5rem;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.user-argument.disabled {
  background: #f5f5f5;
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 1.5rem;
}

.info-text {
  color: #666;
  margin: 0;
  font-style: italic;
}

.argument-actions {
  display: flex;
  gap: 8px;
}

.delete-btn {
  color: #F56C6C;
}
</style> 