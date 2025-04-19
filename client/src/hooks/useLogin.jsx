import { useState, useContext } from 'react';
import { loginService } from '../services/loginService'
import { MyContext } from '../components/variablesGlobal';
import { useNavigate } from 'react-router-dom';

export const useLogin = ()=>{

	const { url } = useContext(MyContext)
	const [isLoading, setIsLoading] = useState(null)
	const navigate = useNavigate();

	const login = async ({ username, password })=>{

		setIsLoading(true)

		try {

			const res = await loginService.login({ url, username, password });
			navigate("/")

		}
		catch(error){
			console.log(error)

		}
		finally {
			setIsLoading(false)
		}

	}



	return { login, isLoading }
	

}