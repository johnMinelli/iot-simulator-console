import React from "react";

import Timestamp from "react-timestamp";
import { InputBase } from '@material-ui/core';

import {
    BackgroundImage, BackgroundImageSrc,
    Page, PageHeader, PageSection,
    DataList, DataListItem, DataListCell,
    Title, Brand, Alert,
} from "@patternfly/react-core";

import {
    ChartArea, ChartBar, ChartLabel, ChartLegend, ChartTheme, Chart, ChartGroup, ChartPie,
    ChartContainer, ChartVoronoiContainer,
} from "@patternfly/react-charts";

import {
    CubesIcon, StreamIcon, AngleDoubleDownIcon, AngleDoubleUpIcon, ClockIcon, ExclamationTriangleIcon, CheckIcon, CloseIcon,
    CogsIcon,
} from '@patternfly/react-icons';

import "./App.css"
import brandImg from "./iot-simulator.svg"

import backgroundLg from "./assets/images/background_1200.jpg"
import backgroundSm from "./assets/images/background_768.jpg"
import backgroundXs from "./assets/images/background_576.jpg"
import backgroundSm2x from "./assets/images/background_768@2x.jpg"
import backgroundXs2x from "./assets/images/background_576@2x.jpg"

import backgroundFilter from "./assets/images/background-filter.svg"
const OFFLINE = 0;
const ONLINE = 1;
const WARNING = 2;

class App extends React.Component {


    render() {
        const background = {
            [BackgroundImageSrc.lg]: backgroundLg,
            [BackgroundImageSrc.sm]: backgroundSm,
            [BackgroundImageSrc.sm2x]: backgroundSm2x,
            [BackgroundImageSrc.xs]: backgroundXs,
            [BackgroundImageSrc.xs2x]: backgroundXs2x,
            [BackgroundImageSrc.filter]: backgroundFilter + "#image_overlay",
        };
        const Header = (<PageHeader
            logo={<Brand alt="IoT Simulator" src={brandImg}/>}
        />);

        return (
            <React.Fragment>
                <BackgroundImage src={background}/>
                <Page header={Header}>
                    <PageSection>
                        <Home/>
                    </PageSection>
                </Page>
            </React.Fragment>
        )
    }
}

export default App;

class HistoryChart extends React.Component {

    containerRef = React.createRef();

    state = {
        width: 0
    };

    componentDidMount() {
        setTimeout(() => {
            this.setState({width: 500});
            window.addEventListener('resize', this.handleResize);
        });
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.handleResize);
    }

    getTooltipLabel = datum => `${datum.name}: ${Home.fixedNumber(datum.y, 1)}`;

    handleResize = () => {
        this.setState({width: this.containerRef.current.clientWidth});
    };

    render() {

        const {width} = this.state;
        const container = <ChartVoronoiContainer responsive={false} labels={this.getTooltipLabel}/>;

        const cs = {
            data: {
                strokeWidth: 0
            }
        };

        var chartData = [];
        this.props.data.map(stat=>{
            chartData.push({name:"value", x:stat.timestamp,y:stat.value});
            }
        );

        return (
            <div ref={this.containerRef}>
                <div className="chart-inline chart-overflow">
                    <ChartGroup containerComponent={container} height={75} width={width} padding={{"top": 5}}>
                        <ChartArea data={chartData} style={cs}/>
                    </ChartGroup>
                </div>
            </div>
        )
    }

}

class Home extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            devices: {},
            devCount: [],
            consumerIp: "10.96.25.20",
            velocityStream: 0
        };

        this.staticVelocityStream = 0;

            this.refreshData = this.refreshData.bind(this);

        this.refreshData(null);
    }

    refreshData(event) {
        const o = this;
        var onChangedIpValue = event?event.target.value:null;
        var api = "//" + (onChangedIpValue ? onChangedIpValue : this.state.consumerIp ? this.state.consumerIp : window.location.host).replace(RegExp(":.*"),"")+ ":8080" + "/api";
        console.debug(api);
        fetch(api + "/overview")
            .then(result => {
                return result.json()
            })
            .then(result => {
                o.staticVelocityStream = 0;
                onChangedIpValue?
                    o.setState({
                        consumerIp: onChangedIpValue, overview: result.data})
                    :
                    o.setState({overview: result.data});
            })
    }

    componentDidMount() {
        this.interval = setInterval(() => this.refreshData(null), 1000);
    }

    componentWillUnmount() {
        clearInterval(this.interval);
    }

    static fixedNumber(n, fractionDigits) {
        if (n == null || isNaN(n)) {
            return "␀"
        }
        return n.toFixed(fractionDigits)
    }

    renderConsumer() {

        const o = this;

        var numDevice=Object.keys(this.state.devices).length;

        return (
            <DataListItem className="good">
                <DataListCell>
                    <form>
                        <InputBase
                            className={Home.stateClassName(o.state.consumerIp)}
                            defaultValue={o.state.consumerIp}
                            onChange={o.refreshData}
                        />
                    </form>
                </DataListCell>
                <DataListCell>
                    <CubesIcon/>&nbsp;<strong>{Home.value(numDevice, "Producer", "Producers")}</strong>
                </DataListCell>
                <DataListCell>
                    <AngleDoubleDownIcon/>&nbsp;
                    <strong title="msgs/s" data-toggle="tooltip" data-placement="top">
                        {o.renderSingleValueBy((numDevice==0 || numDevice==(this.state.devCount[OFFLINE]+this.state.devCount[WARNING]))?0:this.state.velocityStream,3, "msgs/s")}&nbsp;
                    </strong>                </DataListCell>
                    <DataListCell className="chart-cell">
                        {numDevice==0?"":o.renderConnectionChart()}
                    </DataListCell>
            </DataListItem>
        )
    }

    renderConnectionChart() {
        return (<div className="chart-inline">
            <div>
                <ChartPie
                    animate={{duration: 500}}
                    containerComponent={<ChartContainer responsive={false}/>}
                    labels={datum => `${datum.x}: ${Home.fixedNumber(datum.y, 0)}`}
                    height={80} width={80}
                    padding={10}
                    data={[
                        {"x": "online", "y": this.state.devCount[ONLINE]||0},
                        {"x": "warning", "y": this.state.devCount[WARNING]||0},
                        {"x": "offline", "y": this.state.devCount[OFFLINE]||0},
                    ]}
                />
            </div>
            <ChartLegend
                orientation={"vertical"}
                data={[{"name": "online"}, {"name": "warning"}, {"name": "offline"}]}
                rowGutter={-8} gutter={20}
                itemsPerRow={3}
                height={80} width={200}
            />
        </div>)
    }

    renderSingleValueBy(value, fractionDigits, tooltip) {
        return (<span
            title={tooltip} data-toggle="tooltip"
            data-placement="top">
            {(value != null) ? (value != 0) ? (value).toFixed(fractionDigits) : 0 : "␀"}
        </span>)
    }

    static value(value, singular, plural) {
        return (value + " " + ((value === 1) ? singular : plural));
    }

    renderProducer(resource) {

        const o = this;

        if (resource['device'] == null) {
            return
        }
        if(resource.status=="online" && this.state.devices[resource.device] != ONLINE){
            this.state.devCount[this.state.devices[resource.device]]--;
            this.state.devices[resource.device] = ONLINE;
            this.state.devCount[ONLINE] = (this.state.devCount[ONLINE]||0)+1
            //if someone online no need to refresh state because will renderspeed
        } else if(resource.status=="warning" && this.state.devices[resource.device] != WARNING){
            this.state.devCount[this.state.devices[resource.device]]--;
            this.state.devices[resource.device] = WARNING;
            this.state.devCount[WARNING] = (this.state.devCount[WARNING]||0)+1
            //if someone warning no need to refresh state because will renderspeed
        } else if(resource.status=="offline" && this.state.devices[resource.device] != OFFLINE){
            this.state.devCount[this.state.devices[resource.device]]--;
            this.state.devices[resource.device] = OFFLINE;
            this.state.devCount[OFFLINE] = (this.state.devCount[OFFLINE]||0)+1
            this.setState({});
        } else if(resource.status=="disconnect" && this.state.devices[resource.device] != null){
            this.state.devCount[this.state.devices[resource.device]]--;
            delete this.state.devices[resource.device];
            this.setState({}); return ;
        }
        return (
            <DataListItem className={Home.stateClassName(resource) + " chart-list"}>
                <DataListCell>
                    {resource['device']}
                </DataListCell>
                <DataListCell>
                    <StreamIcon/>&nbsp;
                    <strong>{resource['type']}</strong>
                </DataListCell>
                <DataListCell>
                    <AngleDoubleUpIcon/>&nbsp;
                    <strong>
                        {(resource['status']=="online"||resource['status']=="warning")?
                            o.renderSpeed(resource):""}
                    </strong>
                </DataListCell>
                <DataListCell>
                    {(resource['status']=="online")?<CheckIcon color="green"/>:(resource['status']=="warning")?<ExclamationTriangleIcon color="#ffd600"/>:<CloseIcon color="red"/>}&nbsp;
                    <strong>
                        {(resource['status']=="online"||resource['status']=="warning")?
                            <Timestamp date={resource.lasttimestamp/1000} />
                            :
                            ["Last seen: ",<Timestamp relative date={resource.lasttimestamp/1000} />]}
                    </strong>
                </DataListCell>
                <DataListCell className="chart-cell" width={2}>
                    <HistoryChart data={resource.data}/>
                </DataListCell>
            </DataListItem>
        );
    }

    renderSpeed(resource) {
        if(resource.velocity==null){
            var lastIndex = resource.data.length-1;
            var i = 0;
            var mex = 0;
            for(;resource.data[lastIndex-i]>=resource.data[lastIndex]&&i!=lastIndex;i++){mex++}
            var beforeLastIndex = lastIndex-i;
            if(lastIndex == beforeLastIndex)
                return this.renderSingleValueBy(0,0,"Initializing..");
            else if(resource.data[lastIndex].timestamp-resource.data[beforeLastIndex].timestamp==0) {
                resource.velocity=resource.data.length+" (MAX)";
                this.staticVelocityStream+=resource.data.length;
                this.setState({velocityStream:resource.data.length})
                return this.renderSingleValueBy(resource.data.length, 0, "msgs/s (MAX)");   //useless?
            }else{
                var velocity = mex / ((resource.data[lastIndex].timestamp-resource.data[beforeLastIndex].timestamp)/1000);
                resource.velocity=velocity;
                this.staticVelocityStream+=velocity;
                if(!isNaN(this.state.velocityStream))this.setState({velocityStream: this.staticVelocityStream});
                return this.renderSingleValueBy(velocity,3,"msgs/s");   //useless?
            }
        }else
            return this.renderSingleValueBy(resource.velocity,3,"msgs/s");
    }

    static stateClassName(common) {
        return common.good ? "good" : "failed";
    }

    renderAllProd(data){
        const o = this;

        var type = "";
        var tenant = "";
        return data.map(resource=>{
            if(resource['type'] != type || resource['tenant'] != tenant){
                type = resource['type'];
                tenant = resource['tenant'];
                return(
                    <div>
                        <Title size="3xl">{tenant}</Title>
                        <DataList aria-label="List of all consumers">
                            {o.renderProducer(resource)}
                        </DataList>
                    </div>
                );
            }else{
                return(
                    <DataList aria-label="List of all consumers">
                        {o.renderProducer(resource)}
                    </DataList>
                );
            }
        })
    }

    sortByKey(jsObj){
        var sortedArray = [];
        for(var i in jsObj)
            sortedArray.push(jsObj[i]);
        return sortedArray.sort();
    }

    render() {
        const o = this;

        //sort
        var data = this.state.overview;
        if(data!=null)data=o.sortByKey(data);
        return (
            <div>
                <div>
                    <DataList aria-label="consumer">
                        {o.renderConsumer()}
                    </DataList>
                </div>
                {(data!=null && data!={})?
                    o.renderAllProd(data)
                :
                    <div><Title size="3xl">Nothing to consume</Title></div>
                }
            </div>
        );
    }
}
