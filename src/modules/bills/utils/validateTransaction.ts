import type { TransactionResponse } from 'src/integration/interswitch/types';

/**
 *This function validates the transaction response and amount
 * @param transaction The transaction to confirm
 * @param amount  The amount from user input
 * @description Response codes 00, 10, 11  are successful transactions
 * @url https://docs.interswitchgroup.com/docs/payment-response-codes
 * @returns
 */
export const validateTransaction = (
  transaction: Pick<TransactionResponse, 'ResponseCode' | 'Amount'>,
  amount: number,
): boolean => {
  const isSuccessfulTransaction =
    transaction.ResponseCode === '00' ||
    transaction.ResponseCode === '10' ||
    transaction.ResponseCode === '11';

  return isSuccessfulTransaction && amount === transaction.Amount;
};
