import { useState } from 'react';
import { useHistory } from 'react-router';

import styled from "styled-components"


const Searchbar = () => {
  const history = useHistory();

  const [input, setInput] = useState('');

  const [showSnack, setShowSnack] = useState(false)

  const handleInput = ({ target }) => {
    setInput(target.value)
  };

  const handleSearch = (event, search) => {
    event.preventDefault()
    if (search.length < 1) {
      // show err snack
      setShowSnack(true)
    } else {
      // send to page that loads user with input information
      history.push(`/${search}`)
    }

  };



  return (
    <>
      <Form
        onSubmit={(event) => handleSearch(event, input)}
      >
        <Input
          value={input}
          onChange={handleInput}
          placeholder="Enter ETH Address or ENS"
        />
        <Button type="submit">Search</Button>

        <Snack display={showSnack} >
          <ErrText>Nothing entered to submit</ErrText>
        </Snack>
      </Form>

    </>
  )
};

export default Searchbar;



const Snack = styled.div`
  position: absolute;
  
  display: ${({ display }) => display ? "" : "none"};
  top: 0;
  left: 0;
`

const ErrText = styled.p`
  font-size: 12px;
  color: red;
`

const Input = styled.input`
  background-color: transparent;
  border: none;
  color: white;
  font-size: 20px;
  line-height: 2;
  flex: 1;
  padding-right: 15px;
  transition: all 300ms cubic-bezier(0.645, 0.045, 0.355, 1);

  &:focus,
  &:active {
  outline: none;
}
  &::placeholder {
  color: white;
  }
`

const Button = styled.button`
  font-weight: 700;
  font-size: 15px;
  line-height: 1;
  cursor: pointer;
  background-color: gray;
  width: 70px;
  height: 70px;
  border: none;
  border-radius: 20px;
  outline: none;
  color: white;
  transition: all 300ms cubic-bezier(0.645, 0.045, 0.355, 1);

  &:hover {
      background-color: #ffffff;
      color: #181818;
    }
`

const Form = styled.form`
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    background: linear-gradient(to top, #0d1117, #161c26);
    border: 1px solid #30363d;
    /* Change width of the form depending if the bar is opened or not */
    width: 30rem;
    /* If bar opened, normal cursor on the whole form. If closed, show pointer on the whole form so user knows he can click to open it */
    cursor: auto;
    padding-left: 25px;
    padding-right: 15px;
    height: 100px;
    border-radius: 20px;
    transition: all 300ms cubic-bezier(0.645, 0.045, 0.355, 1);
    &:hover {
      /* background: #dbffff; */
    }
    &:hover ${Input} {
      /* color: #181818; */
       &:active {
        /* outline: none;
        color: #181818; */
        }
      &::placeholder {
        /* color: #181818; */
      }
    }
    
  `