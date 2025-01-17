export function jsontocsv(items: any[], title: string, headers: string[]) {
    try {
        const replacer = (_key: string, value: any) => value === null ? '' : value;
        const csv = [
            headers.join(','),
            ...items.map(row => headers.map(fieldName => JSON.stringify(row[fieldName], replacer)).join(','))
        ].join('\r\n');

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', title + '.csv');
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    } catch (error) {
        console.error('Error converting JSON to CSV:', error);
    }
}
