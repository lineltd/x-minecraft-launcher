<template>
  <v-card>
    <v-container grid-list-md>
      <v-layout
        column
        fill-height
        style="padding: 0 30px;"
      >
        <div
          tag="h1"
          class="white--text"
          xs1
        >
          <span class="headline">{{ t('user.challenges') }}</span>
        </div>
        <div
          v-if="refreshing"
          grow
        />
        <div
          v-if="refreshing || challenges.length === 0"
          offset-xs4
        >
          <v-progress-circular
            indeterminate
            :width="7"
            :size="170"
            color="white"
          />
        </div>
        <div
          v-else
          xs1
        >
          <v-text-field
            v-for="(c, index) in challenges"
            :key="c.question.id"
            hide-details
            :label="c.question.question"
            color="primary"

            style="margin-bottom: 10px;"
            @input="updateAnswer(index, $event)"
          />
        </div>
        <v-alert
          :model-value="error"
          type="error"
          transition="scale-transition"
        >
          {{ error ? error.errorMessage : '' }}
        </v-alert>
        <div
          d-flex
          grow
        />
        <div
          d-flex
          shrink
        >
          <v-layout wrap>
            <div
              d-flex
              xs12
              class="white--text"
            >
              <v-spacer />
              <a
                style="z-index: 1;"
                target="browser"
                href="https://account.mojang.com/me/changeSecretQuestions"
              >{{ t('user.forgetChallenges') }}</a>
            </div>
            <div
              d-flex
              xs12
            >
              <v-btn
                block
                :loading="loading"
                color="primary"
                @click="submit"
              >
                <v-icon
                  left
                >
                  check
                </v-icon>
                {{ t('user.submitChallenges') }}
              </v-btn>
            </div>
          </v-layout>
        </div>
      </v-layout>
    </v-container>
  </v-card>
</template>

<script lang=ts>
import { injection } from '@/util/inject'
import { kUserContext, useMojangSecurity } from '../composables/user'

export default defineComponent({
  props: { show: Boolean },
  setup(props) {
    const { t } = useI18n()
    const { userProfile } = injection(kUserContext)
    const { submit, challenges, error, security, refreshing, loading, check } = useMojangSecurity(userProfile)
    function updateAnswer(index: number, content: string) {
      challenges.value[index].answer.answer = content
      error.value = undefined
    }
    watch(computed(() => props.show), (newValue) => {
      if (newValue) {
        check()
      }
    })
    return {
      t,
      loading,
      updateAnswer,
      challenges,
      error,
      security,
      refreshing,
      submit,
    }
  },
})
</script>

<style>
</style>
