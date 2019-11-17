import React, { Component } from 'react';
import { FaGithubAlt, FaPlus, FaSpinner } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { Form, SubmitButton, List } from './styles';
import Container from '../../components/Container';
import api from '../../services/api';

/**
 *
 *  1. Captando erros
Adicione um try/catch por volta do código presente na função handleSubmit
presente no componente Main e caso um repositório não seja encontrado na API do Github
adicione uma borda vermelha por volta do input em que o usuário digitou o nome do repositório.


2. Repositório duplicado
Antes de fazer a chamada à API na função handleSubmit faça uma verificação para ver se o repositório não está duplicado,
 ou seja, se ele ainda não existe no estado de repositories.

Caso exista, dispare um erro, e com isso o código cairá no catch do try/catch criado na funcionalidade anterior.

throw new Error('Repositório duplicado');
*/

export default class Main extends Component {
  state = {
    newRepo: '',
    repositories: [],
    loading: false,
    notfound: false,
  };

  componentDidMount() {
    const repositories = localStorage.getItem('repositories');

    if (repositories) {
      this.setState({ repositories: JSON.parse(repositories) });
    }
  }

  componentDidUpdate(_, prevState) {
    const { repositories } = this.state;
    if (prevState.repositories !== repositories) {
      localStorage.setItem('repositories', JSON.stringify(repositories));
    }
  }

  handleInputChange = e => {
    this.setState({ newRepo: e.target.value });
  };

  handleSubmit = async e => {
    e.preventDefault();

    try {
      this.setState({ loading: true, notfound: false });

      const { newRepo, repositories } = this.state;

      if (newRepo === '') {
        throw new Error('Informe um repositorio');
      }

      const hasRepo = await repositories.find(p => p.name === newRepo);

      if (hasRepo) {
        throw new Error('Repositorio duplicado');
      }

      const response = await api.get(`/repos/${newRepo}`);

      const data = {
        name: response.data.full_name,
      };

      this.setState({
        repositories: [...repositories, data],
        newRepo: '',
        loading: false,
      });
    } catch (err) {
      console.log(err);
      this.setState({
        loading: false,
        notfound: true,
      });
    }
  };

  render() {
    const { newRepo, repositories, loading, notfound } = this.state;

    return (
      <Container>
        <h1>
          <FaGithubAlt />
          Repositorios
        </h1>

        <Form onSubmit={this.handleSubmit} notfound={notfound}>
          <input
            type="text"
            placeholder="Adicionar repositorio"
            value={newRepo}
            onChange={this.handleInputChange}
          />

          <SubmitButton loading={loading}>
            {loading ? (
              <FaSpinner color="#FFF" size={14} />
            ) : (
              <FaPlus color="#FFF" size={14} />
            )}
          </SubmitButton>
        </Form>

        <List>
          {repositories.map(repository => (
            <li key={repository.name}>
              <span>{repository.name}</span>
              <Link to={`/repository/${encodeURIComponent(repository.name)}`}>
                Detalhes
              </Link>
            </li>
          ))}
        </List>
      </Container>
    );
  }
}
