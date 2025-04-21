<script setup lang="ts">
import { computed, ref } from 'vue'
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

const result = computed(() => getKvitt(localState.value.party, localState.value.initialPayments))

// format nr to max 2 decimals
const formatNumber = (num: number) => {
  return num.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })
}
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
          @change="
            (e) => {
              const event = e.target as HTMLInputElement
              if (event.value === '') {
                localState.party.splice(index, 1)
              }
            }
          "
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
              @change="
                (e) => {
                  const event = e.target as HTMLInputElement
                  if (event.value === '' || event.value === '0') {
                    localState.initialPayments.splice(index, 1)
                  }
                }
              "
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
    <div v-if="result.paymentsForBalance.length > 0">
      <h2>Result</h2>
      <div v-for="(payment, index) in result.paymentsForBalance" :key="index">
        {{ payment.from }} should pay {{ formatNumber(payment.payment) }} to {{ payment.to }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.party {
  display: flex;
  flex-direction: row;
  gap: 1rem;
  flex-wrap: wrap;
}
.payments {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.payment-row {
  display: flex;
  flex-direction: row;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.payment-input {
  display: flex;
  flex-direction: column;
}

.add-payment-button {
  width: fit-content;
}
.remove-payment-button {
  margin-top: auto;
  height: fit-content;
}

.main-flow {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
select {
  height: 100%;
}
</style>
