import { Keypair, SystemProgram, Transaction } from "@solana/web3.js";
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { MINT_SIZE, TOKEN_2022_PROGRAM_ID, createMintToInstruction, createAssociatedTokenAccountInstruction, getMintLen, createInitializeMetadataPointerInstruction, createInitializeMintInstruction, TYPE_SIZE, LENGTH_SIZE, ExtensionType, mintTo, getOrCreateAssociatedTokenAccount, getAssociatedTokenAddressSync } from "@solana/spl-token"
import { createInitializeInstruction, pack } from '@solana/spl-token-metadata';
import { useState } from 'react';


export function TokenLaunchpad() {
    const { connection } = useConnection();
    const { publicKey, sendTransaction } = useWallet();
    const [tokenName, setTokenName] = useState('');
    const [tokenSymbol, setTokenSymbol] = useState('');
    const [tokenImage, setTokenImage] = useState('');
    const [initialSupply, setInitialSupply] = useState('');
    const [isCreating, setIsCreating] = useState(false);

    async function createToken() {
        if (!publicKey) {
            alert('Please connect your wallet first');
            return;
        }

        if (!tokenName || !tokenSymbol || !tokenImage || !initialSupply) {
            alert('Please fill all fields');
            return;
        }

        setIsCreating(true);
        
        try {
            const mintKeypair = Keypair.generate();
            const metadata = {
                mint: mintKeypair.publicKey,
                name: tokenName,
                symbol: tokenSymbol.padEnd(4, ' '),
                uri: tokenImage,
                additionalMetadata: [],
            };

            const mintLen = getMintLen([ExtensionType.MetadataPointer]);
            const metadataLen = TYPE_SIZE + LENGTH_SIZE + pack(metadata).length;

            const lamports = await connection.getMinimumBalanceForRentExemption(mintLen + metadataLen);

            const transaction = new Transaction().add(
                SystemProgram.createAccount({
                    fromPubkey: publicKey,
                    newAccountPubkey: mintKeypair.publicKey,
                    space: mintLen,
                    lamports,
                    programId: TOKEN_2022_PROGRAM_ID,
                }),
                createInitializeMetadataPointerInstruction(mintKeypair.publicKey, publicKey, mintKeypair.publicKey, TOKEN_2022_PROGRAM_ID),
                createInitializeMintInstruction(mintKeypair.publicKey, 9, publicKey, null, TOKEN_2022_PROGRAM_ID),
                createInitializeInstruction({
                    programId: TOKEN_2022_PROGRAM_ID,
                    mint: mintKeypair.publicKey,
                    metadata: mintKeypair.publicKey,
                    name: metadata.name,
                    symbol: metadata.symbol,
                    uri: metadata.uri,
                    mintAuthority: publicKey,
                    updateAuthority: publicKey,
                }),
            );
                
            transaction.feePayer = publicKey;
            transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
            transaction.partialSign(mintKeypair);

            await sendTransaction(transaction, connection);

            console.log(`Token mint created at ${mintKeypair.publicKey.toBase58()}`);
            const associatedToken = getAssociatedTokenAddressSync(
                mintKeypair.publicKey,
                publicKey,
                false,
                TOKEN_2022_PROGRAM_ID,
            );

            console.log(associatedToken.toBase58());

            const transaction2 = new Transaction().add(
                createAssociatedTokenAccountInstruction(
                    publicKey,
                    associatedToken,
                    publicKey,
                    mintKeypair.publicKey,
                    TOKEN_2022_PROGRAM_ID,
                ),
            );

            await sendTransaction(transaction2, connection);

            const transaction3 = new Transaction().add(
                createMintToInstruction(mintKeypair.publicKey, associatedToken, publicKey, Number(initialSupply) * 1000000000, [], TOKEN_2022_PROGRAM_ID)
            );

            await sendTransaction(transaction3, connection);

            console.log("Minted!")
            alert(`Token created successfully! Mint address: ${mintKeypair.publicKey.toBase58()}`);
            
            // Reset form
            setTokenName('');
            setTokenSymbol('');
            setTokenImage('');
            setInitialSupply('');
        } catch (error) {
            console.error('Error creating token:', error);
            alert(`Error creating token: ${error.message}`);
        } finally {
            setIsCreating(false);
        }
    }

    return  <div style={{
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column'
    }}>
        <h1>Solana Token Launchpad</h1>
        <input 
            className='inputText' 
            type='text' 
            placeholder='Token Name' 
            value={tokenName}
            onChange={(e) => setTokenName(e.target.value)}
        /> <br />
        <input 
            className='inputText' 
            type='text' 
            placeholder='Token Symbol' 
            value={tokenSymbol}
            onChange={(e) => setTokenSymbol(e.target.value)}
        /> <br />
        <input 
            className='inputText' 
            type='text' 
            placeholder='Image URL' 
            value={tokenImage}
            onChange={(e) => setTokenImage(e.target.value)}
        /> <br />
        <input 
            className='inputText' 
            type='number' 
            placeholder='Initial Supply' 
            value={initialSupply}
            onChange={(e) => setInitialSupply(e.target.value)}
        /> <br />
        <button onClick={createToken} className='btn' disabled={isCreating}>
            {isCreating ? 'Creating Token...' : 'Create a token'}
        </button>
    </div>
}