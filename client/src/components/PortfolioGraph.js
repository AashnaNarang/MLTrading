import React from 'react';
import '../Home.css';
import { Line } from 'react-chartjs-2';
import { generateHeaders } from '../api/utilities';
import { HOST, PORTFOLIO_VALUES_URI } from '../constants';
import axios from 'axios';

export default class PortfolioGraph extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      userId: '',
      labels: [],
      datasets: []
    };
  }

  componentDidUpdate() {
    if (this.state.datasets.length === 0) {
      axios
        .get(`${HOST}${PORTFOLIO_VALUES_URI}/${this.props.portfolioId}`, generateHeaders())
        .then(res => {
          let graphLabels = [];
          let graphData = [];
          for (let obj of res.data) {
            const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "June",
              "July", "Aug", "Sept", "Oct", "Nov", "Dec"
            ];
            graphData.push(obj.portfolioValue);
            const time = new Date(obj.dateAdded);
            const timeString = (monthNames[time.getMonth() + 1]) + ' ' + time.getDate() + ' ' + time.getFullYear();
            graphLabels.push(timeString.toString());
          }
          this.setState({
            labels: graphLabels,
            datasets: [
              {
                borderColor: 'rgba(0,0,0,1)',
                borderWidth: 1,
                fill: false,
                data: graphData,
                //bezier curve off
                tension: 0,
                //remove points from graph 
                pointRadius: 0,
              }
            ]
          });
        })
        .catch(err => {
          console.log(`error: ${err.message}`);
        })
    }
  }

  render() {

    const { labels, datasets } = this.state

    return (
      <div>
        <Line
          data={{ labels, datasets }}
          options={
            {
              title: {
                display: true,
                text: 'Portfolio Value',
                fontSize: 20,
              },
              legend: {
                display: false,
                position: 'right'
              }
            }}
          width={window.innerWidth/2.5}
          height={window.innerHeight/2.5}
        />
      </div>
    );
  }
}