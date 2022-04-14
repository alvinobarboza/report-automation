const getDate = ()=>{    
    return (new Date()).toLocaleDateString();
}

const getCurrentMonth = () => {
	return (new Date).toLocaleString('pt-BR', {month: 'short'})
		.toLocaleUpperCase()
		.split('.')[0];
}

const getCurrentYear = () => {
	return (new Date).getFullYear();
}

const getLastMonthTimestamp = () => {
	return (new Date((new Date).setMonth((new Date)
		.getMonth() - 1))).getTime();
}

const convertTimestampToMonthAndYear = (timestamp) => {
	const year = (new Date(timestamp)).getFullYear();
	const month = (new Date(timestamp)).toLocaleString('pt-BR', {month: 'short'}).toLocaleUpperCase().split('.')[0];
	return {year, month};
}

module.exports = {
    getCurrentMonth,
    getCurrentYear,
    getDate,
    getLastMonthTimestamp,
    convertTimestampToMonthAndYear
}