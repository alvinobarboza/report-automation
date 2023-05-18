const fs = require('fs');

const accessLog = (req) => {
    const today = new Date();
    const date = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
    const time = `${today.getHours()}:${today.getMinutes()}:${today.getSeconds()}`;
    const fileDateReference = `${date}T${today.getHours()}`;

    const data = `[${date} ${time}] ${req}"`;

    const dirPath = `./out/${fileDateReference}`;
    const filePath = `${dirPath}/access_logs_${fileDateReference}.txt`;

    // Check if logs directory doesn't exist
    if (!fs.existsSync(dirPath)) {

        // Crete new directory witn name logs
        fs.mkdirSync(dirPath, { recursive: true });
    }

    // Check if file doesn't exist
    if (!fs.existsSync(filePath)) {

        // Crete new file witn name access_log.txt
        fs.writeFileSync(filePath, '', 'utf-8');
    }

    // Read access_log.txt file
    const logs = fs.readFileSync(filePath, 'utf-8');
    const newLogs = logs === '' ? data : logs + "\n" + data;

    // Write new access_log.txt file with new log data
    fs.writeFileSync(filePath, newLogs, 'utf-8');
}
module.exports = {
    accessLog,
}