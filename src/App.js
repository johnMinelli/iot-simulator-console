import $ from 'jquery';
import React from "react";
import {
    Page, PageHeader, PageSection,
    DataList, DataListItem, DataListCell,
    Title,
} from "@patternfly/react-core";

import {
    CubesIcon, AngleDoubleDownIcon, AngleDoubleUpIcon, OkIcon, ErrorCircleOIcon, ClockIcon, ExclamationTriangleIcon
} from '@patternfly/react-icons';

import "./App.css"

class App extends React.Component {

    render() {
        const Header = (<PageHeader
            logo="IoT Simulator"
        />)

        return <React.Fragment>
            <Page header={Header}>
                <PageSection>
                    <Home/>
                </PageSection>
            </Page>
        </React.Fragment>
    }
}

export default App;

class Home extends React.Component {

    constructor(props) {
        super(props);
        this.api = "//" + window.location.host + "/api";
        this.state = {
            overview: {
                tenants: []
            },
        };
        this.refreshData();
    }

    refreshData() {
        fetch(this.api + "/overview")
            .then(result => {
                return result.json()
            })
            .then(data => {
                console.log(data);
                this.setState({overview: data});
            })
    }

    componentDidMount() {
        this.interval = setInterval(() => this.refreshData(), 1000);
    }

    componentWillUnmount() {
        clearInterval(this.interval);
    }

    renderConsumers(tenant) {
        if (tenant.consumers == null) {
            return
        }
        return tenant.consumers.map(function (consumer, i) {
            return (
                <DataListItem>
                    <DataListCell>
                        {(consumer.messagesPerSecond != null && consumer.messagesPerSecond > 0) ? <OkIcon/> :
                            <ErrorCircleOIcon/>}&nbsp;consumer
                    </DataListCell>
                    <DataListCell>
                        {consumer.type}
                    </DataListCell>
                    <DataListCell>
                        <CubesIcon/>&nbsp;<strong>{consumer.replicas} Pods</strong>
                    </DataListCell>
                    <DataListCell>
                        <AngleDoubleDownIcon/>&nbsp;
                        <strong title="msgs/s" data-toggle="tooltip" data-placement="top">
                            {(consumer.messagesPerSecond != null) ? consumer.messagesPerSecond.toFixed(0) : "␀"} received
                        </strong>
                    </DataListCell>
                    <DataListCell>&nbsp;</DataListCell>
                    <DataListCell>&nbsp;</DataListCell>
                </DataListItem>
            )
        })
    }

    renderProducers(tenant) {
        if (tenant.producers == null) {
            return
        }
        return tenant.producers.map(function (producer, i) {
            return (
                <DataListItem>
                    <DataListCell>
                        {(producer.messagesPerSecondFailed != null && producer.messagesPerSecondFailed <= 0) ?
                            <OkIcon/> :
                            <ErrorCircleOIcon/>}&nbsp;
                        producer
                    </DataListCell>
                    <DataListCell>
                        {producer.type + " / " + producer.protocol}
                    </DataListCell>
                    <DataListCell>
                        <CubesIcon/>&nbsp;
                        <strong>{producer.replicas} Pods</strong>
                    </DataListCell>
                    <DataListCell>
                        <AngleDoubleUpIcon/>&nbsp;
                        <strong>
                            <span title="msgs/s" data-toggle="tooltip" data-placement="top">
                                {(producer.messagesPerSecondSent != null) ? producer.messagesPerSecondSent.toFixed(0) : "␀"} sent</span>
                        </strong>
                    </DataListCell>
                    <DataListCell>
                        <ClockIcon/>&nbsp;
                        <strong>
                            <span
                                title="msgs/s configured" data-toggle="tooltip"
                                data-placement="top">{producer.messagesPerSecondConfigured}</span>&nbsp;→&nbsp;
                            <span
                                title="msgs/s scheduled" data-toggle="tooltip"
                                data-placement="top">{(producer.messagesPerSecondScheduled != null) ? producer.messagesPerSecondScheduled.toFixed(0) : "␀"}</span>
                        </strong>
                    </DataListCell>
                    <DataListCell>
                        <ExclamationTriangleIcon/>
                        <strong>
                            <span
                                title="msgs/s failed" data-toggle="tooltip"
                                data-placement="top">{(producer.messagesPerSecondFailed != null) ? producer.messagesPerSecondFailed.toFixed(0) : "␀"}</span>&nbsp;/&nbsp;
                            <span
                                title="msgs/s errored" data-toggle="tooltip"
                                data-placement="top">{(producer.messagesPerSecondErrored != null) ? producer.messagesPerSecondErrored.toFixed(0) : "␀"}</span>
                        </strong>
                    </DataListCell>
                </DataListItem>
            );
        })
    }

    render() {
        const o = this;
        return (
            <div>
                {
                    this.state.overview.tenants.map(function (tenant, i) {
                        return (
                            <div>
                                <Title size="3xl">{tenant.name}</Title>
                                <DataList>
                                    {o.renderConsumers(tenant)}
                                    {o.renderProducers(tenant)}
                                </DataList>
                            </div>
                        )
                    })
                }
            </div>
        );
    }
}
