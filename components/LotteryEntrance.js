// have a function to enter the lottery

import { useMoralis, useWeb3Contract } from "react-moralis"
// import { Contract } from "web3uikit"
import { abi, contractAddresses } from "../constants"
import { useEffect, useState } from "react"
import { ethers } from "ethers"
import { useNotification } from "web3uikit"

export default function LotteryEntrance() {
    const { Moralis, chainId: chainIdHex, isWeb3Enabled } = useMoralis()
    const chainId = parseInt(chainIdHex) // "PaeseInt" make the number from hex code
    const raffleAddress = chainId in contractAddresses ? contractAddresses[chainId][0] : null
    const [entranceFee, setEntranceFee] = useState("0")
    const [numPlayers, setNumPlayers] = useState("0")
    const [recentWinner, setRecentWinner] = useState("0")
    // console.log(raffleAddress)

    const dispatch = useNotification()

    const {
        runContractFunction: enterRaffle,
        isLoading,
        isFetching,
    } = useWeb3Contract({
        abi: abi, //,
        contractAddress: raffleAddress,
        functionName: "enterRaffle",
        params: {}, //
        msgValue: entranceFee,
    })

    const { runContractFunction: getEntranceFee } = useWeb3Contract({
        abi: abi, //,
        contractAddress: raffleAddress,
        functionName: "getEntranceFee",
        params: {}, //
    })

    const { runContractFunction: getNumberOfPlayers } = useWeb3Contract({
        abi: abi, //,
        contractAddress: raffleAddress,
        functionName: "getNumberOfPlayers",
        params: {}, //
    })

    const { runContractFunction: getRecentWinner } = useWeb3Contract({
        abi: abi, //,
        contractAddress: raffleAddress,
        functionName: "getRecentWinner",
        params: {}, //
    })

    async function updateUI() {
        // const something = await getEntranceFee()
        // console.log(something)
        const entranceFeeFromCall = (await getEntranceFee()).toString()
        const numPlayersFromCall = (await getNumberOfPlayers()).toString()
        const recentWinnerFromCall = await getRecentWinner()

        console.log("Entrance fee before update:", entranceFee)
        setEntranceFee(entranceFeeFromCall)
        setNumPlayers(numPlayersFromCall)
        setRecentWinner(recentWinnerFromCall)
        console.log("Entrance fee after update:", entranceFee)
    }

    useEffect(() => {
        if (isWeb3Enabled) {
            updateUI()
        }
    }, [isWeb3Enabled])

    const handlesSuccess = async function (tx) {
        await tx.wait(1)
        handleNewNotification(tx)
        updateUI()
    }

    const handleNewNotification = function () {
        dispatch({
            type: "info",
            message: "Transaction Complete!",
            title: "Transaction Notification",
            position: "bottomR",
            icon: "bell",
        })
    }

    return (
        <div className="p-5">
            Hi from Lottery entranceFee!
            {raffleAddress ? (
                <div>
                    <button
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ml-auto"
                        onClick={async function () {
                            console.log("Button clicked")
                            await enterRaffle({
                                onSuccess: handlesSuccess,
                                onError: (error) => console.log(error),
                            })
                        }}
                        disabled={isLoading || isFetching}
                    >
                        {isLoading || isFetching ? (
                            <div className="animate-spin spinner-border h-8 w-8 border-b-2 rounded-full"></div>
                        ) : (
                            <div>Enter Raffle</div>
                        )}
                    </button>
                    <div>
                        Entrance Fee: {ethers.utils.formatUnits(entranceFee, "ether")}ETH Number Of{" "}
                    </div>
                    <div> Players: {numPlayers} </div>
                    <div>Recent Winner: {recentWinner}</div>
                </div>
            ) : (
                <div>No Raffle Address Detected</div>
            )}
        </div>
    )
}
