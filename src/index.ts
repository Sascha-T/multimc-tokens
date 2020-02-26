import {Client, createClient, ClientOptions} from "minecraft-protocol";
import {platform, homedir} from "os";
import {existsSync, readFileSync} from "fs";
import {join} from "path";

interface Options extends ClientOptions {
    // example: /home/sascha/.local/share/multimc
    multimc_location?: string;
    // username: string = Profile with wanted Username
}


/*
    @WARNING: Truncated code!
 */
interface MultiMC_Root {
    accounts: MultiMC_Account[]
}

/*
    @WARNING: Truncated code!
 */
interface MultiMC_Account {
    accessToken: string;
    clientToken: string;
    username: string;
    profiles: MultiMC_Profile[]
}

/*
    @WARNING: Truncated code!
 */
interface MultiMC_Profile {
    id: string,
    legacy: boolean,
    name: string
}

export function use(options: Options): Client {
    let location;
    if (!options.multimc_location) {
        if (platform() == "linux") {
            if (existsSync(join(homedir(), ".local", "share", "multimc", "accounts.json"))) {
                location = join(homedir(), ".local", "share", "multimc", "accounts.json");
            } else {
                throw "MultiMC location not specified!"
            }
        } else {
            throw "MultiMC location not specified!"
        }
    } else {
        location = join(options.multimc_location, "accounts.json")
    }

    let config;


    let mmc_root: MultiMC_Root;
    try {
        mmc_root = JSON.parse(readFileSync(location, "utf8"));
    } catch (ex) {
        console.error(ex);
        throw "JSON parser error!";
    }

    // mmc_root is now definitely not undefined!

    // Check if JSON contains any accounts.
    if (mmc_root.accounts.length < 1) {
        throw "No accounts signed in.";
    }

    let username: string = "";
    let uid: string = "";


    // Find wanted account.
    let mmc_acc: MultiMC_Account;
    let set = false;
    if (options.username) {
        for (let i in mmc_root.accounts) {
            let acc: MultiMC_Account = mmc_root.accounts[i];
            if (acc.username == options.username) {
                mmc_acc = acc;
                set = true;
                break;
            } else {
                for (let i in acc.profiles) {
                    let profile: MultiMC_Profile = acc.profiles[i];
                    if (profile.name == options.username) {
                        mmc_acc = acc;
                        username = profile.name;
                        uid = profile.id;
                        set = true;
                    }
                }
            }
        }
        if (!set) {
            console.warn("Account not found, using first!");
            mmc_acc = mmc_root.accounts[0];
        }
    } else {
        mmc_acc = mmc_root.accounts[0];
    }

    // Find Username
    if (!username) {
        // @ts-ignore
        username = mmc_acc.profiles[0].name;
        // @ts-ignore
        uid = mmc_acc.profiles[0].id;
    }


    let passthroughOpts: any = {};
    {
        passthroughOpts = options;
        // @ts-ignore | Why!?!?
        passthroughOpts["username"] = username;
        // @ts-ignore | Why!?!?
        passthroughOpts["accessToken"] = mmc_acc.accessToken;
        // @ts-ignore | Why!?!?
        passthroughOpts["clientToken"] = mmc_acc.clientToken;

        passthroughOpts["session"] = {};
        // @ts-ignore | Why!?!?
        passthroughOpts["session"]["accessToken"] = mmc_acc.accessToken;
        // @ts-ignore | Why!?!?
        passthroughOpts["session"]["clientToken"] = mmc_acc.clientToken;
        passthroughOpts["session"]["selectedProfile"] = {};
        passthroughOpts["session"]["selectedProfile"]["name"] = username;
        passthroughOpts["session"]["selectedProfile"]["id"] = uid;
    }

    let client: Client = createClient(passthroughOpts);
    return client;
}
