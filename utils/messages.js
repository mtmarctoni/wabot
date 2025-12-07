function formatMessages(messages) {
	return messages.map(msg => {
		return {
			id: msg.id?._serialized || msg.id,
			from: msg.from,
			to: msg.to,
			fromMe: msg.fromMe,
			type: msg.type,
			timestamp: msg.timestamp || msg.t,
			body: msg.body || msg.caption || '',
			hasMedia: msg.hasMedia || false,
			mediaUrl: msg.deprecatedMms3Url || msg.directPath || null
		};
	});
}

module.exports = { formatMessages };
