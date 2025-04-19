export const loginService = {

	async login ({ url, username, password }) {

		try {
			const response = await fetch(url + "/logear", {
		        method: "POST",
		        credentials: "include",
		        headers: {"Content-Type" : "application/json"},
		        body: JSON.stringify({ username, password }),
		        redirect: "manual"
		    })

		    if(!response.ok) {
		    	const errorText = await response.text()
		    	throw errorText
		    }

		    return await response.text();

		} catch (error) {
			throw error
		}
	}
}