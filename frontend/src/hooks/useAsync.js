import { useCallback, useEffect, useRef, useState } from 'react'
import { getApiErrorMessage } from '../api'

export default function useAsync(asyncFunction, dependencyKey = '') {
  const [state, setState] = useState({ data: null, loading: true, error: null })
  const asyncFunctionRef = useRef(asyncFunction)

  useEffect(() => {
    asyncFunctionRef.current = asyncFunction
  }, [asyncFunction])

  const execute = useCallback(async () => {
    setState((current) => ({ ...current, loading: true, error: null }))
    try {
      const data = await asyncFunctionRef.current()
      setState({ data, loading: false, error: null })
      return data
    } catch (error) {
      setState({ data: null, loading: false, error: getApiErrorMessage(error) })
      return null
    }
  }, [])

  useEffect(() => {
    // Fetching is the external synchronization this hook is responsible for.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    execute()
  }, [execute, dependencyKey])

  return { ...state, retry: execute }
}
