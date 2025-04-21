<script setup lang="ts">
import { ref, watch } from 'vue'
import { getKvitt } from './getKvitt'

type State = {
  party: string[]
  initialPayments: Array<{
    from: string
    amount: number | Record<string, number>
  }>
}
const localState = ref<State>({
  party: ['meris', 'henri'],
  initialPayments: [{ from: 'meris', amount: 100 }],
})

const result = ref(getKvitt(localState.value.party, localState.value.initialPayments))

watch(
  localState,
  () => {
    result.value = getKvitt(localState.value.party, localState.value.initialPayments)
    console.log(localState.value, result.value)
  },
  { deep: true, immediate: true },
)
</script>

<template>
  <div class="main-flow">
    <h1>Kvitt</h1>
    <div>
      <h2>Party</h2>
      <div class="party">
        <input
          v-for="(member, index) in localState.party"
          :key="index"
          v-model="localState.party[index]"
        />
        <button @click="localState.party.push('')">Add member</button>
      </div>
    </div>
    <div>
      <h2>Payments</h2>
      <div class="payments">
        <div
          class="payment-row"
          v-for="(payment, index) in localState.initialPayments"
          :key="index"
        >
          <div class="payment-input">
            <label for="payment-from">From</label>
            <select name="payment-from" id="payment-from" v-model="payment.from">
              <option v-for="(member, index) in localState.party" :key="index" :value="member">
                {{ member }}
              </option>
            </select>
          </div>
          <div class="payment-input">
            <label for="payment-amount">Amount</label>
            <input
              type="number"
              name="payment-amount"
              id="payment-amount"
              v-model="payment.amount"
            />
          </div>
        </div>
        <button
          class="add-payment-button"
          @click="localState.initialPayments.push({ from: '', amount: 0 })"
        >
          Add payment
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.party {
  display: flex;
  flex-direction: row;
  gap: 1rem;
}
.payments {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.payment-row {
  display: flex;
  flex-direction: row;
  gap: 1rem;
}

.payment-input {
  display: flex;
  flex-direction: column;
}

.add-payment-button {
  width: fit-content;
}

.main-flow {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
</style>
