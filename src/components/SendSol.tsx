import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import * as web3 from '@solana/web3.js';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import { FC, useState } from 'react';
import styles from '../styles/Home.module.css';

export const SendSolForm: FC = () => {
    const [txSig, setTxSig] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');
    const { connection } = useConnection();
    const { publicKey, sendTransaction } = useWallet();

    const link = () => {
        return txSig ? `https://explorer.solana.com/tx/${txSig}?cluster=devnet` : '';
    };

    const sendSol = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError('');
        if (!connection || !publicKey) {
            setError('Please connect your wallet.');
            return;
        }
        
        const amount = parseFloat(event.currentTarget.amount.value);
        if (isNaN(amount) || amount <= 0) {
            setError('Please enter a valid amount.');
            return;
        }

        setLoading(true);
        
        try {
            const transaction = new web3.Transaction();
            const recipientPubKey = new web3.PublicKey(event.currentTarget.recipient.value);

            const sendSolInstruction = web3.SystemProgram.transfer({
                fromPubkey: publicKey,
                toPubkey: recipientPubKey,
                lamports: LAMPORTS_PER_SOL * amount,
            });

            transaction.add(sendSolInstruction);
            const signature = await sendTransaction(transaction, connection);
            setTxSig(signature);
        } catch (err) {
            setError('Transaction failed: ' + (err as Error).message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            {publicKey ? (
                <form onSubmit={sendSol} className={styles.form}>
                    <label htmlFor="amount">Amount (in SOL) to send:</label>
                    <input
                        id="amount"
                        type="number"
                        step="0.0001"
                        min="0"
                        className={styles.formField}
                        placeholder="e.g. 0.1"
                        required
                    />
                    <br />
                    <label htmlFor="recipient">Send SOL to:</label>
                    <input
                        id="recipient"
                        type="text"
                        className={styles.formField}
                        placeholder="e.g. 4Zw1fXuYuJhWhu9KLEYMhiPEiqcpKd6akw3WRZCv84HA"
                        required
                    />
                    <button type="submit" className={styles.formButton} disabled={loading}>
                        {loading ? 'Sending...' : 'Send'}
                    </button>
                    {error && <p className={styles.error}>{error}</p>}
                </form>
            ) : (
                <span className='flex justify-center'>Connect Your Wallet</span>
            )}
            {txSig && (
                <div className='flex justify-center'>
                    <p>View your transaction on</p> 
                    <br /> <a className='text-yellow size-24' href={link()} target="_blank" rel="noopener noreferrer">
                 Solana Explorer
                    </a>
                </div>
            )}
        </div>
    );
};
