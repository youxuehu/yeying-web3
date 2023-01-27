import yargs from "yargs/yargs";
import {hideBin} from "yargs/helpers";
import solc from 'solc';
import fs from 'fs';
import path from 'path';
import {fileURLToPath} from 'url';
import {homedir} from "os";
import {ethers} from "ethers";
import inquirer from 'inquirer';

const homeDir = homedir();
const dirName = path.dirname(fileURLToPath(import.meta.url));

// reference:https://github.com/yargs/yargs/blob/main/docs/advanced.md
yargs(hideBin(process.argv))
    .command('contract [command]', 'The command for contract', (yargs) => {
        return yargs.command('compile [files...] [targetDir]', 'Compiling contract.', (yargs) => {
            return yargs.option('files', {
                describe: 'The files to compile.', type: 'array', alias: 'f', demandOption: true
            }).option('targetDir', {
                describe: 'The directory to save compiled files.', type: 'string', alias: 't', default: '/tmp'
            })
        }, argv => {
            argv.files.forEach(f => compile(f, argv.targetDir));
        }).command('deploy [files...] [password] [provider]', 'Deploying contract.', (yargs) => {
            return yargs.option('files', {
                describe: 'The compiled files to deploy.', type: 'array', alias: 'f', demandOption: true
            }).option('password', {
                describe: 'The password of deploying identity.', type: 'string', alias: 'p',
            }).option('provider', {
                describe: 'The ipc file for ethers', type: 'string', default: `${homeDir}/eth/yeying/data/geth.ipc`
            })
        }, async argv => {
            await deploy(argv.files, argv.password, argv.provider);
        })
    }, (argv) => {
        console.log(`argv=${argv}`);
        if (argv.verbose) console.info(`${argv.command} contract`)
    })
    .option('verbose', {
        alias: 'v', type: 'boolean', description: 'Run with verbose logging'
    })
    .parse();

async function deploy(files, password, provider) {
    const ipcProvider = new ethers.providers.IpcProvider(provider);
    const accounts = await ipcProvider.listAccounts();
    // reference:https://www.digitalocean.com/community/tutorials/nodejs-interactive-command-line-prompts
    const account = await inquirer.prompt([{
        type: 'rawlist', name: 'signer', message: 'Select a index of Account?', choices: accounts,
    }]);

    console.log(`Use the account=${account.signer}`);
    if (account === undefined) {
        throw new Error("Please select blockchain identity firstly!");
    }

    if (password == undefined) {
        const input = await inquirer.prompt([{type: 'password', name: 'secret', message: 'Tell me a secret',},]);
        password = input.secret;
        console.info('Answer:', password);
    }

    const signer = ipcProvider.getSigner(account.signer);
    const unlock = await signer.unlock(password);
    if (!unlock) {
        throw new Error("Fail to unlock the identity!");
    }

    for (const file of files) {
        console.log(`Try to deploying contract=${file}`);
        const contract = JSON.parse(fs.readFileSync(file, 'utf8'));

        let keys = Object.keys(contract);
        for (let i = 0; i < keys.length; i++) {
            let key = keys[i];
            let registryContract = await new ethers.ContractFactory(contract[key].abi, contract[key].evm.bytecode.object, signer).deploy();
            console.log(`Contract is deployed successfully, result=${JSON.stringify(registryContract)}`);
            registryContract = await registryContract.deployed()
            await registryContract.deployTransaction.wait();
            console.log(`Contract address=${registryContract.address}`);
        }
    }
}

function compile(file, targetDir) {
    if (!fs.existsSync(file)) {
        file = path.resolve(dirName, file);
    }

    const source = fs.readFileSync(file, 'utf8');
    const fileName = path.basename(file);
    const input = {
        language: 'Solidity', sources: {
            [fileName]: {
                content: source,
            },
        }, settings: {
            outputSelection: {
                '*': {
                    '*': ['*'],
                },
            },
        },
    };

    const output = solc.compile(JSON.stringify(input));
    const jsonPath = path.resolve(targetDir, path.parse(file).name + '.json');
    fs.writeFileSync(jsonPath, JSON.stringify(JSON.parse(output).contracts[fileName]));
    return jsonPath;
}
