import cron from "node-cron";

import User from "../models/users.model.js"

export const removeUnverifiedAccounts = () => {
    cron.schedule(" */30 * * * * ", async () => {
        const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000)

        // unverifiedAccounts will be deleted after 30 mins

        await User.deleteMany({
            accountVerified: false,
            createdAt: { $lt: thirtyMinutesAgo },
        })
    })
}